from functools import lru_cache

from openai import OpenAI
from pinecone import Pinecone

from core.config import get_settings

settings = get_settings()

openai_client = OpenAI(
    api_key=settings.openai_api_key,
    max_retries=settings.openai_max_retries,
    timeout=settings.openai_timeout,
)
pc = Pinecone(api_key=settings.pinecone_api_key)


@lru_cache(maxsize=1)
def _index():
    """Resolve the index on first use, not at import.

    pc.Index() makes a live control-plane call to look up the host. At module
    scope that added a network round trip to every cold start, and raised
    before the app could boot if the index did not exist yet — turning a
    missing index into a 500 on every route, not just /query.
    """
    return pc.Index(settings.pinecone_index_name)


def _format_match(match: dict) -> str:
    meta = match["metadata"]
    location = meta["source"]
    if meta.get("start_line"):
        location += f":{int(meta['start_line'])}-{int(meta['end_line'])}"
    if meta.get("symbol"):
        location += f" ({meta['symbol']})"
    return f"Source: {location}\n{meta['text']}"


def query(question: str, top_k: int = 5) -> str:
    embedding = openai_client.embeddings.create(
        model=settings.embedding_model,
        input=question,
    ).data[0].embedding

    results = _index().query(vector=embedding, top_k=top_k, include_metadata=True)

    context = "\n\n---\n\n".join(_format_match(m) for m in results["matches"])

    response = openai_client.chat.completions.create(
        model=settings.chat_model,
        max_tokens=settings.chat_max_tokens,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant that answers questions about a code repository. "
                    "Use only the provided context to answer. If the answer isn't in the context, say so. "
                    "Cite file paths and line numbers from the context when they support your answer."
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
    )

    return response.choices[0].message.content
