from pydantic import BaseModel, Field

class LastNightRequest(BaseModel):
    subject: str = Field(..., min_length=2, max_length=100, example="Thermodynamics")
    hours: float = Field(..., gt=0, le=24, example=6.0)

class LastNightResponse(BaseModel):
    subject: str
    hours_available: float
    priority_topics: list
    study_plan: list
    quick_quiz: list
    survival_tip: str