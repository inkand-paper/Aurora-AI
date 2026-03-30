from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.analogy_service import generate_analogy

router = APIRouter(
    prefix="/api/analogy",
    tags=["Analogy Generator 🧠"]
)

class AnalogyRequest(BaseModel):
    topic: str = Field(..., min_length=2, max_length=100, example="Entropy")
    subject: str = Field(..., min_length=2, max_length=100, example="Thermodynamics")

@router.post("/generate")
async def get_analogy(request: AnalogyRequest):
    if not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty")

    result = await generate_analogy(
        topic=request.topic,
        subject=request.subject
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result