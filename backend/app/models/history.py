from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base


class History(Base):
    __tablename__ = "history"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)
    feature_type = Column(String, nullable=False)  # last_night, analogy, reality, skill_income
    input_data   = Column(JSON, nullable=False)
    output_data  = Column(JSON, nullable=False)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="history")