from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from app.services.skill_income_service import generate_skill_income_plan

router = APIRouter(
    prefix="/api/skill-income",
    tags=["Skill → Income 💰"]
)

class SkillIncomeRequest(BaseModel):
    skill: str = Field(..., min_length=2, max_length=100, example="Python Programming")
    level: Literal["beginner", "intermediate", "advanced"] = Field(..., example="intermediate")
    hours_per_week: float = Field(..., gt=0, le=168, example=10.0)

@router.post("/generate")
async def skill_to_income(request: SkillIncomeRequest):
    result = await generate_skill_income_plan(
        skill=request.skill,
        level=request.level,
        hours_per_week=request.hours_per_week
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    return result