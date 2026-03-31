from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import last_night, analogy, reality, skill_income, auth, history
from app.models.user import User
from app.models.history import History

origins = [
    "http://localhost:3000",
    "https://aurora-ai-steel.vercel.app",
]

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
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(last_night.router)
app.include_router(analogy.router)
app.include_router(reality.router)
app.include_router(skill_income.router)
app.include_router(history.router)

@app.get("/")
def root():
    return {"message": "AURORA API is running 🚀", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}