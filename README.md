# RepoAI

Ask natural language questions about any GitHub repository. Paste a URL, and RepoAI clones, parses, and embeds the codebase so you can query it in plain English — no grepping, no reading walls of code.

## How it works

1. Paste a GitHub repo URL
2. The backend shallow-clones the repo (`--depth 1`), skipping lock files, build output and vendored code
3. Tree-sitter splits each source file into functions, classes and methods, recording the line range of each
4. Chunks are embedded via OpenAI in parallel and upserted to Pinecone in batches
5. Ask questions — the backend retrieves the most relevant chunks and answers, citing file paths and line numbers

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

| Method | Endpoint  | Description                                  |
|--------|-----------|----------------------------------------------|
| GET    | `/health` | Liveness check; used to wake a sleeping host |
| POST   | `/ingest` | Clone and embed a GitHub repo                |
| POST   | `/query`  | Ask a question about the repo                |

`/ingest` accepts only `https://` GitHub and GitLab URLs of the form
`https://host/owner/repo`, and is rate-limited to 3 requests an hour.
`/query` is limited to 30 a minute. Both return `Retry-After` on a 429.

### Deployment note

Both endpoints are defined with `def`, not `async def`, so FastAPI runs them in
its threadpool. That is deliberate: the work is blocking, and an `async def`
handler would run it on the event loop and stall every other request for the
duration of an ingest.
