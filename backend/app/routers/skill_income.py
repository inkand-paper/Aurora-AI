from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Literal
from sqlalchemy.orm import Session
from app.services.skill_income_service import generate_skill_income_plan
from app.services.history_service import save_history
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/skill-income",
    tags=["Skill → Income 💰"]
)

class SkillIncomeRequest(BaseModel):
    skill:          str                                    = Field(..., min_length=2, max_length=100)
    level:          Literal["beginner", "intermediate", "advanced"]
    hours_per_week: float                                  = Field(..., gt=0, le=168)

@router.post("/generate")
async def skill_to_income(
    request: SkillIncomeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await generate_skill_income_plan(
        skill=request.skill,
        level=request.level,
        hours_per_week=request.hours_per_week,
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    save_history(
        db=db,
        user_id=current_user.id,
        feature_type="skill_income",
        input_data={
            "skill": request.skill,
            "level": request.level,
            "hours_per_week": request.hours_per_week,
        },
        output_data=result,
    )

    return result