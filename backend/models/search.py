from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SearchCreate(BaseModel):
    niche: str
    location: str

class SearchResponse(BaseModel):
    id: str
    niche: str
    location: str
    status: str
    progress_percent: int
    message: Optional[str] = None
    total_results: int
    leads_collected: int
    error_message: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None

class SearchProgress(BaseModel):
    id: str
    status: str
    progress_percent: int
    message: Optional[str] = None
    leads_collected: int
