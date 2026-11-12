import os
import subprocess
import time
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

from core.config import get_settings
from services.parser_service import (
    CHUNK_NODES,
    CONTAINER_NODES,
    WRAPPER_NODES,
    get_parser,
)

settings = get_settings()

openai_client = OpenAI(
    api_key=settings.openai_api_key,
    max_retries=settings.openai_max_retries,
    timeout=settings.openai_timeout,
)
pc = Pinecone(api_key=settings.pinecone_api_key)


class IngestError(Exception):
    """Ingestion failed for a reason worth showing the user verbatim."""


def clone_repo(url: str, dest: str) -> None:
    """Clone just enough to read the current code once and throw it away.

    Full history is pure waste here — no historical blob is ever read — and on
    a large repo it dominates the request. Measured on django: 56s full vs 4s
    shallow.
    """
    env = {
        **os.environ,
        # Never block waiting on a credential prompt for a private repo.
        "GIT_TERMINAL_PROMPT": "0",
        "GIT_ASKPASS": "true",
        # ext:: transports are already default-denied on modern git; pin the
        # allowed set so an older git in a container can't reopen that hole.
        "GIT_ALLOW_PROTOCOL": "http:https",
    }
    try:
        subprocess.run(
            [
                "git", "clone",
                # A private or missing repo makes git ask for credentials.
                # GIT_TERMINAL_PROMPT alone does not stop a configured helper
                # (macOS keychain, for one) from blocking indefinitely; an
                # empty helper disables them and turns the hang into a fast
                # "unable to get password" failure.
                "-c", "credential.helper=",
                "-c", "credential.interactive=false",
                "--depth", "1",
                "--single-branch",
                "--no-tags",
                "--no-recurse-submodules",
                # `--` stops a URL beginning with `-` being parsed as a flag.
                "--", url, dest,
            ],
            check=True,
            capture_output=True,
            timeout=settings.clone_timeout_seconds,
            env=env,
        )
    except subprocess.TimeoutExpired:
        raise IngestError(
            "That repository took too long to download. Try a smaller one."
        )
    except subprocess.CalledProcessError:
        raise IngestError(
            "Could not clone that repository. Check that the URL points to a "
            "public GitHub repo."
        )

    size = sum(f.stat().st_size for f in Path(dest).rglob("*") if f.is_file())
    if size > settings.max_repo_bytes:
        raise IngestError(
            f"That repository is {size // 1_000_000}MB, larger than RepoAI "
            "indexes in a single pass."
        )


def collect_files(repo_path: str) -> list[Path]:
    """Walk the tree, pruning whole directories rather than filtering after.

    Descending into node_modules only to discard every file is the difference
    between walking a few hundred paths and a few tens of thousands.
    """
    root = Path(repo_path)
    found: list[Path] = []

    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in settings.ignored_dirs]

        for name in filenames:
            path = Path(dirpath) / name
            if path.suffix not in settings.all_extensions:
                continue
            if name in settings.ignored_names:
                continue
            if name.endswith(settings.ignored_suffixes):
                continue
            try:
                if path.stat().st_size > settings.max_file_bytes:
                    continue
            except OSError:
                continue
            found.append(path)

    return found


def _split_oversized(text: str) -> list[str]:
    """Break text on line boundaries into embeddable pieces, with overlap.

    Splitting on whitespace and rejoining with spaces — the previous approach —
    collapses every newline and every level of indentation. For Python, where
    indentation is the syntax, that stores something that is no longer code.
    """
    if len(text) <= settings.target_chunk_chars:
        return [text] if text.strip() else []

    lines = text.splitlines(keepends=True)
    pieces: list[str] = []
    buf: list[str] = []
    size = 0

    for line in lines:
        # A single line longer than the budget (minified bundles) can't be
        # split on newlines; cut it hard so it can never exceed the API limit.
        if len(line) > settings.max_chunk_chars:
            if buf:
                pieces.append("".join(buf))
                buf, size = [], 0
            step = settings.target_chunk_chars
            pieces.extend(
                line[i:i + step] for i in range(0, len(line), step)
            )
            continue

        if size + len(line) > settings.target_chunk_chars and buf:
            pieces.append("".join(buf))
            keep: list[str] = []
            kept = 0
            for prev in reversed(buf):
                if kept + len(prev) > settings.chunk_overlap_chars:
                    break
                keep.insert(0, prev)
                kept += len(prev)
            buf, size = keep, kept

        buf.append(line)
        size += len(line)

    if buf:
        pieces.append("".join(buf))

    return [p for p in pieces if p.strip()]


def _node_chunks(node, source: bytes, targets: set, out: list, depth: int = 0) -> None:
    """Collect named definitions, descending into ones too large to embed."""
    for child in node.children:
        inner = child
        while inner.type in WRAPPER_NODES and inner.children:
            nxt = next((c for c in inner.children if c.is_named), None)
            if nxt is None or nxt is inner:
                break
            inner = nxt

        is_target = child.type in targets or inner.type in targets
        text = source[child.start_byte:child.end_byte].decode("utf-8", errors="ignore").strip()

        if is_target and text:
            # A whole class can be far too big for one vector, and it buries
            # its methods. Descend instead of emitting the blob.
            if len(text) > settings.max_chunk_chars and depth < 3:
                _node_chunks(inner, source, targets, out, depth + 1)
            elif len(text) > settings.target_chunk_chars * 3 and depth < 3 and (
                inner.type in CONTAINER_NODES
            ):
                _node_chunks(inner, source, targets, out, depth + 1)
            elif len(text) >= settings.min_chunk_chars:
                out.append(
                    {
                        "text": text,
                        "start_line": child.start_point[0] + 1,
                        "end_line": child.end_point[0] + 1,
                        "symbol": _symbol_of(inner, source),
                    }
                )
        elif child.type in CONTAINER_NODES and depth < 3:
            _node_chunks(child, source, targets, out, depth + 1)


def _symbol_of(node, source: bytes) -> str | None:
    name = node.child_by_field_name("name")
    if name is None:
        return None
    return source[name.start_byte:name.end_byte].decode("utf-8", errors="ignore")


def _tree_sitter_chunks(text: str, suffix: str) -> list[dict]:
    parser = get_parser(suffix)
    source = text.encode("utf-8")
    tree = parser.parse(source)

    out: list[dict] = []
    _node_chunks(tree.root_node, source, CHUNK_NODES[suffix], out)

    if not out:
        return [{"text": p} for p in _split_oversized(text)]

    # Anything still oversized after descent gets cut to fit.
    sized: list[dict] = []
    for chunk in out:
        if len(chunk["text"]) <= settings.max_chunk_chars:
            sized.append(chunk)
        else:
            sized.extend({**chunk, "text": p} for p in _split_oversized(chunk["text"]))
    return sized


def collect_chunks(files: list[Path], root: Path) -> list[dict]:
    chunks: list[dict] = []

    for file in files:
        try:
            text = file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        if not text.strip():
            continue

        if file.suffix in settings.code_extensions:
            raw_chunks = _tree_sitter_chunks(text, file.suffix)
        else:
            raw_chunks = [{"text": p} for p in _split_oversized(text)]

        # Store the path relative to the clone, not /tmp/... — it ends up in
        # the LLM context and gets cited back to the user.
        try:
            source = str(file.relative_to(root))
        except ValueError:
            source = file.name

        for i, chunk in enumerate(raw_chunks):
            chunks.append({**chunk, "source": source, "chunk_index": i})

    return chunks


def _embed_batch(texts: list[str]) -> list[list[float]]:
    response = openai_client.embeddings.create(
        model=settings.embedding_model,
        input=texts,
    )
    return [item.embedding for item in response.data]


def _ensure_index() -> None:
    if settings.pinecone_index_name not in pc.list_indexes().names():
        pc.create_index(
            name=settings.pinecone_index_name,
            dimension=settings.embedding_dimension,
            metric=settings.pinecone_metric,
            spec=ServerlessSpec(
                cloud=settings.pinecone_cloud, region=settings.pinecone_region
            ),
        )


def embed_and_store(chunks: list[dict]) -> None:
    if not chunks:
        raise IngestError(
            "No supported source files found in that repository."
        )

    _ensure_index()
    index = pc.Index(settings.pinecone_index_name)

    batches = [
        chunks[i:i + settings.upsert_batch_size]
        for i in range(0, len(chunks), settings.upsert_batch_size)
    ]

    # Embedding is network wait, so batches overlap almost perfectly. Order is
    # preserved by executor.map, which keeps ids aligned with their vectors.
    with ThreadPoolExecutor(max_workers=settings.embedding_workers) as pool:
        embeddings = list(
            pool.map(lambda b: _embed_batch([c["text"] for c in b]), batches)
        )

    vectors = []
    for batch, batch_embeddings in zip(batches, embeddings):
        for chunk, embedding in zip(batch, batch_embeddings):
            metadata = {"text": chunk["text"], "source": chunk["source"]}
            if chunk.get("start_line"):
                metadata["start_line"] = chunk["start_line"]
                metadata["end_line"] = chunk["end_line"]
            if chunk.get("symbol"):
                metadata["symbol"] = chunk["symbol"]
            vectors.append(
                {
                    "id": f"{chunk['source']}::chunk{chunk['chunk_index']}",
                    "values": embedding,
                    "metadata": metadata,
                }
            )

    # Clear only once the new vectors are in hand. Wiping first meant any
    # failure during embedding left the index empty with nothing to restore.
    index.delete(delete_all=True)

    # Pinecone caps a request at 2MB and the SDK does not split for you — an
    # unbatched upsert 400s above roughly 265 vectors.
    index.upsert(
        vectors=vectors,
        batch_size=settings.upsert_batch_size,
        show_progress=False,
    )

    _wait_until_queryable(index, vectors[-1]["id"])


def _wait_until_queryable(index, probe_id: str) -> None:
    """Block until the upserted vectors are actually searchable.

    Pinecone writes are asynchronous, so returning the moment upsert() does
    means the first question can land before the index is ready and come back
    with nothing — which reads as a broken app rather than a timing artifact.

    Probing for a specific new id rather than a total count matters: after a
    re-ingest the stale count already satisfies any threshold, so counting
    would report ready while the old vectors are still the ones being served.
    """
    deadline = time.monotonic() + settings.index_ready_timeout
    while time.monotonic() < deadline:
        try:
            found = index.fetch(ids=[probe_id]).vectors
        except Exception:
            return  # Not worth failing a good ingest over a readiness probe.
        if probe_id in found:
            return
        time.sleep(0.4)


def ingest(repo_url: str) -> int:
    # A per-request directory. The old fixed /tmp/cloned_repo was rmtree'd on
    # entry, so two concurrent ingests deleted each other's clone mid-walk —
    # and nothing ever cleaned it up afterwards.
    with tempfile.TemporaryDirectory(prefix="repoai-") as repo_dir:
        clone_repo(repo_url, repo_dir)
        files = collect_files(repo_dir)
        chunks = collect_chunks(files, Path(repo_dir))
        embed_and_store(chunks)
        return len(chunks)
