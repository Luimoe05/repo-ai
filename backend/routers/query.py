from fastapi import APIRouter, HTTPException, Request, Response

from limiter import limiter
from models.schemas import QueryRequest, QueryResponse
from services.query_service import query

router = APIRouter()


# `def` rather than `async def` for the same reason as /ingest: the embedding
# and completion calls are blocking, and would otherwise stall the event loop.
@router.post("/query", response_model=QueryResponse)
@limiter.limit("30/minute")
# `response` is required by slowapi when headers_enabled=True.
def query_endpoint(request: Request, response: Response, body: QueryRequest):
    try:
        answer = query(body.question, body.top_k)
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="The index could not be reached. Try asking again.",
        )

    return QueryResponse(answer=answer)
