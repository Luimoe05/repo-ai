from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from limiter import limiter
from routers.ingest import router as ingest_router
from routers.query import router as query_router

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://repo-ai-six.vercel.app"],
    allow_origin_regex=r"https://repo-.*\.vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
    # Rate-limit headers are readable by JS only if they're explicitly exposed,
    # so the UI can say how long the wait actually is.
    expose_headers=["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
)


@app.get("/health")
def health():
    """Cheap, dependency-free endpoint the frontend pings on load.

    Free-tier instances sleep between visits, and the first request otherwise
    pays a ~50s spin-up on top of the ingest itself.
    """
    return {"ok": True}


app.include_router(ingest_router)
app.include_router(query_router)
