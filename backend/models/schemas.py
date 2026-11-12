from urllib.parse import urlparse

from pydantic import BaseModel, field_validator


class QueryRequest(BaseModel):
    question: str
    top_k: int = 5


class QueryResponse(BaseModel):
    answer: str


# git clone accepts file:// and plain local paths. Without a host allowlist,
# `{"url": "file:///app"}` clones server-local content into the shared index,
# where the public /query endpoint will happily read it back out.
ALLOWED_HOSTS = {"github.com", "www.github.com", "gitlab.com", "www.gitlab.com"}


class IngestRequest(BaseModel):
    url: str

    @field_validator("url")
    @classmethod
    def validate_repo_url(cls, value: str) -> str:
        value = value.strip()
        parsed = urlparse(value)

        if parsed.scheme != "https" or parsed.netloc.lower() not in ALLOWED_HOSTS:
            raise ValueError(
                "Enter an https:// GitHub or GitLab repository URL."
            )

        parts = [p for p in parsed.path.split("/") if p]
        if len(parts) != 2:
            raise ValueError(
                "That URL should look like https://github.com/owner/repo."
            )

        return value
