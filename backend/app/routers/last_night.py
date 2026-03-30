from fastapi import APIRouter, HTTPException
from app.schemas.study import LastNightRequest
from app.services.last_night_service import generate_last_night_plan

router = APIRouter(
    prefix="/api/last-night",
    tags=["Last Night Mode 🌙"]
)

@router.post("/generate")
async def generate_plan(request: LastNightRequest):
    if not request.subject.strip():
        raise HTTPException(status_code=400, detail="Subject cannot be empty")

    result = await generate_last_night_plan(
        subject=request.subject,
        hours=request.hours
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result