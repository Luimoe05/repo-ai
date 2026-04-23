from dotenv import load_dotenv
import os
import shutil
import subprocess
from pathlib import Path
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
from tree_sitter import Language, Parser
import tree_sitter_python as tspython
import tree_sitter_javascript as tsjavascript
import tree_sitter_typescript as tstypescript

load_dotenv()

REPO_URL = "https://github.com/Luimoe05/Personal-Portfolio.git"
INDEX_NAME = "repo-index"
FALLBACK_CHUNK_SIZE = 500

CODE_EXTENSIONS = {".py", ".js", ".ts", ".jsx", ".tsx"}
PLAIN_EXTENSIONS = {".md", ".txt", ".html", ".css", ".json"}
EXTENSIONS = CODE_EXTENSIONS | PLAIN_EXTENSIONS

# Top-level node types to extract per language
CHUNK_NODES = {
    ".py":  {"function_definition", "class_definition"},
    ".js":  {"function_declaration", "class_declaration", "export_statement", "lexical_declaration"},
    ".jsx": {"function_declaration", "class_declaration", "export_statement", "lexical_declaration"},
    ".ts":  {"function_declaration", "class_declaration", "export_statement", "lexical_declaration"},
    ".tsx": {"function_declaration", "class_declaration", "export_statement", "lexical_declaration"},
}

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))


def _build_parsers() -> dict[str, Parser]:
    parsers = {}
    for ext, (module, attr) in {
        ".py":  (tspython,     "language"),
        ".js":  (tsjavascript, "language"),
        ".jsx": (tsjavascript, "language"),
        ".ts":  (tstypescript, "language_typescript"),
        ".tsx": (tstypescript, "language_tsx"),
    }.items():
        lang = Language(getattr(module, attr)())
        p = Parser(lang)
        parsers[ext] = p
    return parsers

PARSERS = _build_parsers()


def clone_repo(url: str, dest: str) -> None:
    print("Cloning repo...")
    if os.path.exists(dest):
        shutil.rmtree(dest)
    subprocess.run(["git", "clone", url, dest], check=True, capture_output=True)
    print("Clone complete!")


def collect_files(repo_path: str) -> list[Path]:
    files = [
        p for p in Path(repo_path).rglob("*")
        if p.is_file() and p.suffix in EXTENSIONS and ".git" not in p.parts
    ]
    print(f"Found {len(files)} files to process")
    return files


def _fallback_chunks(text: str) -> list[str]:
    words = text.split()
    return [" ".join(words[i:i + FALLBACK_CHUNK_SIZE]) for i in range(0, len(words), FALLBACK_CHUNK_SIZE)]


def _tree_sitter_chunks(text: str, suffix: str) -> list[str]:
    parser = PARSERS[suffix]
    target_nodes = CHUNK_NODES[suffix]
    source = text.encode("utf-8")
    tree = parser.parse(source)

    chunks = []
    for node in tree.root_node.children:
        # Unwrap export statements to check the inner node type too
        inner = node
        if node.type == "export_statement" and node.children:
            inner = next((c for c in node.children if c.is_named), node)

        if node.type in target_nodes or inner.type in target_nodes:
            chunk_text = source[node.start_byte:node.end_byte].decode("utf-8", errors="ignore").strip()
            if chunk_text:
                chunks.append(chunk_text)

    # If tree-sitter found nothing meaningful, fall back to word chunks
    return chunks if chunks else _fallback_chunks(text)


def collect_chunks(files: list[Path]) -> list[dict]:
    print("Chunking files...")
    chunks = []
    for file in files:
        try:
            text = file.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue

        if file.suffix in CODE_EXTENSIONS:
            raw_chunks = _tree_sitter_chunks(text, file.suffix)
        else:
            raw_chunks = _fallback_chunks(text)

        for i, chunk in enumerate(raw_chunks):
            chunks.append({"text": chunk, "source": str(file), "chunk_index": i})

    return chunks


def embed_and_store(chunks: list[dict]) -> None:
    if INDEX_NAME not in pc.list_indexes().names():
        pc.create_index(
            name=INDEX_NAME,
            dimension=1536,
            metric="cosine",
            spec=ServerlessSpec(cloud="gcp", region="us-central1"),
        )

    index = pc.Index(INDEX_NAME)
    total = len(chunks)

    for i, chunk in enumerate(chunks):
        print(f"Embedding chunk {i + 1}/{total}")
        response = openai_client.embeddings.create(
            model="text-embedding-3-small",
            input=chunk["text"],
        )
        print(f"Tokens used: {response.usage.total_tokens}")
        vector = response.data[0].embedding
        index.upsert(vectors=[{
            "id": f"{chunk['source']}::chunk{chunk['chunk_index']}",
            "values": vector,
            "metadata": {"text": chunk["text"], "source": chunk["source"]},
        }])

    print(f"Stored {total} chunks in Pinecone")

def test_query(question: str) -> None:
    response = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=question
    )
    vector = response.data[0].embedding
    
    index = pc.Index(INDEX_NAME)
    results = index.query(vector=vector, top_k=3, include_metadata=True)
    
    for match in results["matches"]:
        print(f"Score: {match['score']}")
        print(f"Source: {match['metadata']['source']}")
        print(f"Text: {match['metadata']['text'][:300]}")
        print("---")




def main():
    repo_dir = "/tmp/cloned_repo"
    clone_repo(REPO_URL, repo_dir)
    files = collect_files(repo_dir)
    chunks = collect_chunks(files)
    embed_and_store(chunks)
    print("Done!")
    test_query("how does the navbar work?")


if __name__ == "__main__":
    main()
