from dotenv import load_dotenv
import os
from openai import OpenAI
from pinecone import Pinecone

load_dotenv()

INDEX_NAME = "repo-index"

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(INDEX_NAME)


def query(question: str) -> str:
    embedding = openai_client.embeddings.create(
        model="text-embedding-3-small",
        input=question,
    ).data[0].embedding

    results = index.query(vector=embedding, top_k=5, include_metadata=True)

    context = "\n\n---\n\n".join(
        f"Source: {m['metadata']['source']}\n{m['metadata']['text']}"
        for m in results["matches"]
    )

    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
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


if __name__ == "__main__":
    while True:
        question = input("\nAsk a question about the repo (or 'quit' to exit): ").strip()
        if question.lower() in {"quit", "exit", "q"}:
            break
        if not question:
            continue
        print("\n" + query(question))
