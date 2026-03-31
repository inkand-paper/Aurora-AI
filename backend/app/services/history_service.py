from sqlalchemy.orm import Session
from app.models.history import History

def save_history(
    db: Session,
    user_id: int,
    feature_type: str,
    input_data: dict,
    output_data: dict
) -> History:
    entry = History(
        user_id      = user_id,
        feature_type = feature_type,
        input_data   = input_data,
        output_data  = output_data,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def get_user_history(db: Session, user_id: int) -> list[History]:
    return (
        db.query(History)
        .filter(History.user_id == user_id)
        .order_by(History.created_at.desc())
        .all()
    )