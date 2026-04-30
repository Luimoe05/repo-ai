import os
import shutil
import subprocess
from pathlib import Path
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from core.config import get_settings
from services.parser_service import PARSERS, CHUNK_NODES

settings = get_settings()

openai_client = OpenAI(api_key=settings.openai_api_key)
pc = Pinecone(api_key=settings.pinecone_api_key)


def clone_repo(url: str, dest: str) -> None:
    if os.path.exists(dest):
        shutil.rmtree(dest)
    subprocess.run(["git", "clone", url, dest], check=True, capture_output=True)


def collect_files(repo_path: str) -> list[Path]:
    return [
        p for p in Path(repo_path).rglob("*")
        if p.is_file() and p.suffix in settings.all_extensions and ".git" not in p.parts
    ]


def _fallback_chunks(text: str) -> list[str]:
    words = text.split()
    return [" ".join(words[i:i + settings.fallback_chunk_size]) for i in range(0, len(words), settings.fallback_chunk_size)]


def _tree_sitter_chunks(text: str, suffix: str) -> list[str]:
    parser = PARSERS[suffix]
    target_nodes = CHUNK_NODES[suffix]
    source = text.encode("utf-8")
    tree = parser.parse(source)

    chunks = []
    for node in tree.root_node.children:
        inner = node
        if node.type == "export_statement" and node.children:
            inner = next((c for c in node.children if c.is_named), node)

        if node.type in target_nodes or inner.type in target_nodes:
            chunk_text = source[node.start_byte:node.end_byte].decode("utf-8", errors="ignore").strip()
            if chunk_text:
                chunks.append(chunk_text)

    return chunks if chunks else _fallback_chunks(text)


def collect_chunks(files: list[Path]) -> list[dict]:
    chunks = []
    for file in files:
        try:
            text = file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        if file.suffix in settings.code_extensions:
            raw_chunks = _tree_sitter_chunks(text, file.suffix)
        else:
            raw_chunks = _fallback_chunks(text)

        for i, chunk in enumerate(raw_chunks):
            chunks.append({"text": chunk, "source": str(file), "chunk_index": i})

    return chunks


def ingest(repo_url: str) -> int:
    repo_dir = "/tmp/cloned_repo"
    clone_repo(repo_url, repo_dir)
    files = collect_files(repo_dir)
    chunks = collect_chunks(files)
    embed_and_store(chunks)
    return len(chunks)


def embed_and_store(chunks: list[dict]) -> None:
    if settings.pinecone_index_name not in pc.list_indexes().names():
        pc.create_index(
            name=settings.pinecone_index_name,
            dimension=settings.embedding_dimension,
            metric=settings.pinecone_metric,
            spec=ServerlessSpec(cloud=settings.pinecone_cloud, region=settings.pinecone_region),
        )

    index = pc.Index(settings.pinecone_index_name)

    batch_size = 200
    vectors = []

    for batch_start in range(0, len(chunks), batch_size):
        batch = chunks[batch_start: batch_start + batch_size]
        response = openai_client.embeddings.create(
            model=settings.embedding_model,
            input=[chunk["text"] for chunk in batch],
        )
        for i, chunk in enumerate(batch):
            vectors.append({
                "id": f"{chunk['source']}::chunk{chunk['chunk_index']}",
                "values": response.data[i].embedding,
                "metadata": {"text": chunk["text"], "source": chunk["source"]},
            })

    index.upsert(vectors=vectors)
