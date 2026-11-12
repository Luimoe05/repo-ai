from fastapi import APIRouter, HTTPException, Request, Response

from limiter import limiter
from models.schemas import IngestRequest
from services.ingest_service import IngestError, ingest

router = APIRouter()


# Deliberately `def`, not `async def`. The body is entirely blocking work —
# git clone, tree-sitter parsing, OpenAI and Pinecone calls — and an `async def`
# runs it on the event loop, freezing every other request for the whole ingest.
# A plain `def` handler gets FastAPI's threadpool instead.
@router.post("/ingest")
@limiter.limit("3/hour")
# `response` is required by slowapi when headers_enabled=True — it injects
# the X-RateLimit-* headers into it on success.
def ingest_endpoint(request: Request, response: Response, body: IngestRequest):
    try:
        chunks_stored = ingest(body.url)
    except IngestError as exc:
        # Raised as a real 4xx so the response passes back through
        # CORSMiddleware. An unhandled exception is caught further out by
        # Starlette's ServerErrorMiddleware, which returns a bare 500 with no
        # CORS headers — the browser then blocks it and the client can only
        # report a network failure.
        raise HTTPException(status_code=400, detail=str(exc))

    return {"message": "Ingestion successful", "chunks_stored": chunks_stored}
