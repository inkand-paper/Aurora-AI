from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.coins import Coins, CoinsTransaction
from app.models.user import User

router = APIRouter(
    prefix="/api/coins",
    tags=["Coins"],
)


class SpendRequest(BaseModel):
    amount: int = Field(..., gt=0)
    reason: str = Field(..., min_length=2, max_length=200)


@router.get("/balance")
def get_balance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    coins = db.query(Coins).filter(Coins.user_id == current_user.id).first()
    return {"balance": coins.balance if coins else 0}


@router.post("/spend")
def spend(
    request: SpendRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    coins = db.query(Coins).filter(Coins.user_id == current_user.id).first()
    if not coins or coins.balance < request.amount:
        raise HTTPException(status_code=400, detail="Insufficient coins")

    coins.balance -= request.amount
    tx = CoinsTransaction(
        user_id=current_user.id,
        amount=-request.amount,  # negative = spent
        reason=request.reason,
    )
    db.add(tx)
    db.commit()
    db.refresh(coins)

    return {"new_balance": coins.balance}

