from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.user import UserRegister, UserLogin, TokenOut, UserOut, UserUpdate
from app.services.auth_service import register_user, login_user
from app.models.user import User

router = APIRouter(
    prefix="/api/auth",
    tags=["Auth"]
)

@router.post("/register", response_model=TokenOut)
def register(data: UserRegister, db: Session = Depends(get_db)):
    user = register_user(data, db)
    token, _ = login_user(data.email, data.password, db)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.post("/login", response_model=TokenOut)
def login(data: UserLogin, db: Session = Depends(get_db)):
    token, user = login_user(data.email, data.password, db)
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/update-profile", response_model=UserOut)
def update_profile(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    current_user.name = data.name
    db.commit()
    db.refresh(current_user)
    return current_user