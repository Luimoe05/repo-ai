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

    # OpenAI models
    embedding_model: str = "text-embedding-3-small"
    chat_model: str = "gpt-4o-mini"

    # Chunking
    fallback_chunk_size: int = 500

    # Supported file extensions
    code_extensions: set = {".py", ".js", ".ts", ".jsx", ".tsx"}
    plain_extensions: set = {".md", ".txt", ".html", ".css", ".json"}

    @property
    def all_extensions(self) -> set:
        return self.code_extensions | self.plain_extensions

    # Query
    top_k: int = 5


_settings = Settings()


def get_settings() -> Settings:
    return _settings


settings = get_settings()