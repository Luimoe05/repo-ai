from fastapi import APIRouter, Request
from services.query_service import query
from models.schemas import QueryRequest, QueryResponse
from limiter import limiter

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
@limiter.limit("30/minute")
async def query_endpoint(request: Request, body: QueryRequest):
    answer = query(body.question, body.top_k)
    return QueryResponse(answer=answer)
