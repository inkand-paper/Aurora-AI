from pydantic import BaseModel
from datetime import datetime
from typing import Any

class HistoryOut(BaseModel):
    id:           int
    feature_type: str
    input_data:   dict[str, Any]
    output_data:  dict[str, Any]
    created_at:   datetime

    class Config:
        from_attributes = True