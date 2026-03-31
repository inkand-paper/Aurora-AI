from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.services.reality_service import generate_reality_check
from app.services.history_service import save_history
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/reality",
    tags=["Reality Mode 📊"]
)

class RealityRequest(BaseModel):
    subject:       str   = Field(..., example="Mathematics")
    planned_hours: float = Field(..., gt=0)
    actual_hours:  float = Field(..., ge=0)
    exam_days:     int   = Field(..., ge=0)

@router.post("/check")
async def reality_check(
    request: RealityRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await generate_reality_check(
        subject=request.subject,
        planned_hours=request.planned_hours,
        actual_hours=request.actual_hours,
        exam_days=request.exam_days,
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    save_history(
        db=db,
        user_id=current_user.id,
        feature_type="reality",
        input_data={
            "subject": request.subject,
            "planned_hours": request.planned_hours,
            "actual_hours": request.actual_hours,
            "exam_days": request.exam_days,
        },
        output_data=result,
    )

    return result