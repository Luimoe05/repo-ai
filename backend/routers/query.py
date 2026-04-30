from fastapi import APIRouter
from services.query_service import query
from models.schemas import QueryRequest, QueryResponse

router = APIRouter()


@router.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest):
    answer = query(request.question, request.top_k)
    return QueryResponse(answer=answer)
