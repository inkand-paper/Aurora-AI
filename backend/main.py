from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import last_night, analogy, reality, skill_income, auth, history, client, coins
from app.models.user import User
from app.models.history import History
from app.models.coins import Coins, CoinsTransaction

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://aurora-ai-steel.vercel.app",
]


class NormalizeCORSPreflightMiddleware(BaseHTTPMiddleware):
    """
    Starlette's CORSMiddleware can return 400 for some preflight variants.
    For `OPTIONS` preflight requests we short-circuit and respond with the
    required CORS headers so the browser can proceed with the real request.
    """

    async def dispatch(self, request: Request, call_next):
        if request.method != "OPTIONS":
            return await call_next(request)

        # Only handle CORS preflight requests (ones created by browsers).
        if "access-control-request-method" not in request.headers:
            return await call_next(request)

        origin = request.headers.get("origin")
        allow_origin = origin if (origin in origins) else None
        if allow_origin is None:
            # Fall back to normal handling (and let CORSMiddleware decide).
            return await call_next(request)

        allow_methods = request.headers.get("access-control-request-method", "POST")
        allow_headers = request.headers.get("access-control-request-headers", "*")

        resp = Response(status_code=200)
        resp.headers["Access-Control-Allow-Origin"] = allow_origin
        resp.headers["Access-Control-Allow-Methods"] = allow_methods
        resp.headers["Access-Control-Allow-Headers"] = allow_headers
        resp.headers["Access-Control-Allow-Credentials"] = "true"
        resp.headers["Vary"] = "Origin, Access-Control-Request-Method, Access-Control-Request-Headers"
        return resp

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI Academic Survival System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    # Be permissive to avoid preflight failures due to casing/headers differences.
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.add_middleware(NormalizeCORSPreflightMiddleware)

app.include_router(auth.router)
app.include_router(last_night.router)
app.include_router(analogy.router)
app.include_router(reality.router)
app.include_router(skill_income.router)
app.include_router(history.router)
app.include_router(client.router)
app.include_router(coins.router)

@app.get("/")
def root():
    return {"message": "AURORA API is running 🚀", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}