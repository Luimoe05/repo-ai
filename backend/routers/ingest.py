from fastapi import APIRouter
from services.ingest_service import ingest
from models.schemas import IngestRequest

router = APIRouter()

@router.post("/ingest")
async def ingest_endpoint(request: IngestRequest):
    chunks_stored = ingest(request.url)
    return {"message": "Ingestion successful", "chunks_stored": chunks_stored}
