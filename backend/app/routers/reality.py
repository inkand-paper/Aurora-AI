from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.reality_service import generate_reality_check

router = APIRouter(
    prefix="/api/reality",
    tags=["Reality Mode 📊"]
)

class RealityRequest(BaseModel):
    subject: str = Field(..., example="Mathematics")
    planned_hours: float = Field(..., gt=0, example=10.0)
    actual_hours: float = Field(..., ge=0, example=4.0)
    exam_days: int = Field(..., ge=0, example=3)

@router.post("/check")
async def reality_check(request: RealityRequest):
    result = await generate_reality_check(
        subject=request.subject,
        planned_hours=request.planned_hours,
        actual_hours=request.actual_hours,
        exam_days=request.exam_days
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result