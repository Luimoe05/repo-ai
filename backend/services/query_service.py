from openai import OpenAI
from pinecone import Pinecone
from core.config import get_settings

settings = get_settings()

openai_client = OpenAI(api_key=settings.openai_api_key)
pc = Pinecone(api_key=settings.pinecone_api_key)
index = pc.Index(settings.pinecone_index_name)


def query(question: str, top_k: int = 5) -> str:
    embedding = openai_client.embeddings.create(
        model=settings.embedding_model,
        input=question,
    ).data[0].embedding

    results = index.query(vector=embedding, top_k=top_k, include_metadata=True)

    context = "\n\n---\n\n".join(
        f"Source: {m['metadata']['source']}\n{m['metadata']['text']}"
        for m in results["matches"]
    )

    response = openai_client.chat.completions.create(
        model=settings.chat_model,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant that answers questions about a code repository. "
                    "Use only the provided context to answer. If the answer isn't in the context, say so."
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
    )

    return response.choices[0].message.content
