# RepoAI

Ask natural language questions about any GitHub repository. Paste a URL, and RepoAI clones, parses, and embeds the codebase so you can query it in plain English — no grepping, no reading walls of code.

## How it works

1. Paste a GitHub repo URL
2. The backend clones the repo, parses it with Tree-sitter, and embeds the chunks via OpenAI
3. Vectors are stored in Pinecone
4. Ask questions — the backend retrieves relevant chunks and returns an answer

## Tech stack

**Frontend**
- React 19 + TypeScript
- Vite
- Plain CSS with CSS custom properties

**Backend**
- FastAPI (Python)
- OpenAI — embeddings + completions
- Pinecone — vector storage
- Tree-sitter — language-aware code parsing
- GitPython — repo cloning

## Prerequisites

- Python 3.10+
- Node.js 18+
- An [OpenAI API key](https://platform.openai.com)
- A [Pinecone](https://pinecone.io) account and API key

## Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```env
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_INDEX_NAME=your_index_name
```

Start the server:

```bash
uvicorn main:app --reload
```

The API runs at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## API

| Method | Endpoint  | Description                        |
|--------|-----------|------------------------------------|
| POST   | `/ingest` | Clone and embed a GitHub repo      |
| POST   | `/query`  | Ask a question about the repo      |
