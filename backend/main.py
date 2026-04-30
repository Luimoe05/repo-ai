from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.ingest import router as ingest_router
from routers.query import router as query_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingest_router)
app.include_router(query_router)
