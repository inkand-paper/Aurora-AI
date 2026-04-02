from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import Literal
from app.services.analogy_service import generate_analogy
from app.services.history_service import save_history
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/api/analogy",
    tags=["Analogy Generator 🧠"]
)

class AnalogyRequest(BaseModel):
    topic:   str = Field(..., min_length=2, max_length=100)
    subject: str = Field(..., min_length=2, max_length=100)
    mode:    Literal["funny", "story", "teacher", "savage"] = "teacher"

@router.post("/generate")
async def get_analogy(
    request: AnalogyRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await generate_analogy(
        topic=request.topic,
        subject=request.subject,
        mode=request.mode,
    )

    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])

    save_history(
        db=db,
        user_id=current_user.id,
        feature_type="analogy",
        input_data={"topic": request.topic, "subject": request.subject, "mode": request.mode},
        output_data=result,
    )

    return result