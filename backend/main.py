from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.routers import last_night, analogy, reality, skill_income
import os

origins = [
    "http://localhost:3000",
    "https://your-frontend-domain.com",  # add this when deploying
]

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI Academic Survival System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# All feature routers
app.include_router(last_night.router)
app.include_router(analogy.router)
app.include_router(reality.router)
app.include_router(skill_income.router)

@app.get("/")
def root():
    return {"message": "AURORA API is running 🚀", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}