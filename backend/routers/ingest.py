from fastapi import APIRouter, Request
from services.ingest_service import ingest
from models.schemas import IngestRequest
from limiter import limiter

router = APIRouter()

@router.post("/ingest")
@limiter.limit("3/hour")
async def ingest_endpoint(request: Request, body: IngestRequest):
    chunks_stored = ingest(body.url)
    return {"message": "Ingestion successful", "chunks_stored": chunks_stored}
