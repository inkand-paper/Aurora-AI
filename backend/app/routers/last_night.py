from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.study import LastNightRequest
from app.services.last_night_service import generate_last_night_plan
from app.services.history_service import save_history
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/last-night",
    tags=["Last Night Mode 🌙"]
)

@router.post("/generate")
async def generate_plan(
    request: LastNightRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not request.subject.strip():
        raise HTTPException(status_code=400, detail="Subject cannot be empty")

    result = await generate_last_night_plan(
        subject=request.subject,
        hours=request.hours
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Save to history
    save_history(
        db=db,
        user_id=current_user.id,
        feature_type="last_night",
        input_data={"subject": request.subject, "hours": request.hours},
        output_data=result,
    )

    return result