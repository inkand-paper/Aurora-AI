from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.history_service import save_history
from app.services.client_service import (
    generate_client_brief,
    evaluate_submission,
    get_balance,
)

router = APIRouter(
    prefix="/api/client",
    tags=["AI Client Mode"]
)

class BriefRequest(BaseModel):
    skill: str = Field(..., min_length=2, max_length=100)

class SubmissionRequest(BaseModel):
    skill:            str
    brief:            str
    submission:       str = Field(..., min_length=20)
    personality_type: str

@router.post("/brief")
async def get_brief(
    request: BriefRequest,
    current_user: User = Depends(get_current_user),
):
    result = await generate_client_brief(request.skill)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@router.post("/evaluate")
async def evaluate(
    request: SubmissionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = await evaluate_submission(
        skill=request.skill,
        brief=request.brief,
        submission=request.submission,
        personality_type=request.personality_type,
        user_id=current_user.id,
        db=db,
    )
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    # Save to history for AI Client Mode.
    save_history(
        db=db,
        user_id=current_user.id,
        feature_type="ai_client",
        input_data={
            "skill": request.skill,
            "brief": request.brief,
            "submission": request.submission,
            "personality_type": request.personality_type,
        },
        output_data=result,
    )
    return result