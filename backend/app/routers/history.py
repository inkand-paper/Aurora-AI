from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.history import HistoryOut
from app.services.history_service import get_user_history

router = APIRouter(
    prefix="/api/history",
    tags=["History"]
)

@router.get("/", response_model=list[HistoryOut])
def get_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_history(db, current_user.id)