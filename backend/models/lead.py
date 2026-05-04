from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class LeadResponse(BaseModel):
    id: str
    search_id: str
    google_key: str
    business_name: str
    category: Optional[str] = None
    full_address: Optional[str] = None
    phone: Optional[str] = None
    website_url: Optional[str] = None
    rating: Optional[float] = None
    total_reviews: Optional[int] = None
    google_maps_link: Optional[str] = None
    is_favorite: bool
    user_notes: Optional[str] = None
    user_status: str
    created_at: datetime

class LeadUpdate(BaseModel):
    is_favorite: Optional[bool] = None
    user_status: Optional[str] = None
    user_notes: Optional[str] = None

class LeadFilter(BaseModel):
    search_id: Optional[str] = None
    status: Optional[str] = None
    is_favorite: Optional[bool] = None
    has_website: Optional[bool] = None
    name: Optional[str] = None
    sort_by: Optional[str] = "date"
    sort_dir: Optional[str] = "desc"
    page: int = 1
    per_page: int = 25
