from dotenv import load_dotenv
import os

load_dotenv()


class Settings:
    # API keys
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    pinecone_api_key: str = os.getenv("PINECONE_API_KEY", "")

    # Pinecone
    pinecone_index_name: str = "repo-index"
    pinecone_cloud: str = "gcp"
    pinecone_region: str = "us-central1"
    embedding_dimension: int = 1536
    pinecone_metric: str = "cosine"

    # A single upsert request is capped at 2MB server-side. Vectors serialize to
    # roughly 7.5KB each on the wire, so ~265 is the real ceiling; 100 leaves
    # comfortable headroom for large chunk text in metadata.
    upsert_batch_size: int = 100

    # OpenAI models
    embedding_model: str = "text-embedding-3-small"
    chat_model: str = "gpt-4o-mini"

    # Embedding requests are pure network wait, so they parallelise almost
    # linearly. Kept modest to stay well inside per-minute token limits.
    embedding_workers: int = 8
    openai_max_retries: int = 5
    openai_timeout: float = 60.0
    chat_max_tokens: int = 800

    # Chunking. Budgets are in characters because the alternative (tiktoken)
    # downloads its BPE tables on first use, which would add a network
    # dependency to cold start. Code runs ~3 chars/token in the worst case
    # (minified JS), so 18000 chars stays under the 8191-token input limit.
    max_chunk_chars: int = 18_000
    target_chunk_chars: int = 2_400
    chunk_overlap_chars: int = 240
    min_chunk_chars: int = 80

    # Pinecone writes are async; how long to wait for them to become
    # searchable before returning success to the user.
    index_ready_timeout: float = 20.0

    # Clone
    clone_timeout_seconds: int = 120
    max_repo_bytes: int = 500 * 1024 * 1024
    max_file_bytes: int = 400_000

    # Supported file extensions
    code_extensions: frozenset = frozenset({".py", ".js", ".ts", ".jsx", ".tsx"})
    plain_extensions: frozenset = frozenset({".md", ".txt", ".html", ".css", ".json"})
    all_extensions: frozenset = code_extensions | plain_extensions

    # Directories that hold dependencies, build output, or vendored code. None
    # of it answers questions about the repo, and on a typical JS project it is
    # the majority of the bytes on disk.
    ignored_dirs: frozenset = frozenset({
        ".git", ".hg", ".svn", ".tox", ".next", ".nuxt", ".cache",
        "node_modules", "bower_components", "vendor", "third_party",
        "venv", ".venv", "env", "site-packages", "__pycache__",
        "dist", "build", "out", "target", "coverage", ".pytest_cache",
    })

    # Lock files are dependency resolution trees. On RepoAI's own frontend,
    # package-lock.json alone is ~66% of everything that would be embedded.
    ignored_names: frozenset = frozenset({
        "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
        "poetry.lock", "Cargo.lock", "composer.lock", "Gemfile.lock",
    })

    ignored_suffixes: tuple = (".min.js", ".min.css", ".map", ".bundle.js", ".lock")

    # Query
    top_k: int = 5


_settings = Settings()


def get_settings() -> Settings:
    return _settings


settings = get_settings()
