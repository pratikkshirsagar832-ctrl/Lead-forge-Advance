from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from auth import get_current_user
from models.lead import LeadUpdate
from database import supabase
from services.export_service import generate_csv
from typing import Optional

router = APIRouter(prefix="/api/leads", tags=["leads"], dependencies=[Depends(get_current_user)])

def apply_filters(query, search_id: Optional[str] = None, status: Optional[str] = None,
                 is_favorite: Optional[bool] = None, has_website: Optional[bool] = None,
                 name: Optional[str] = None):
    if search_id:
        query = query.eq("search_id", search_id)
    if status and status != "All":
        query = query.eq("user_status", status.lower())
    if is_favorite is not None:
        query = query.eq("is_favorite", is_favorite)
    if has_website is not None:
        if has_website:
            query = query.not_.is_("website_url", "null").neq("website_url", "")
        else:
            # Simple check for empty or null
            query = query.or_("website_url.is.null,website_url.eq.")
    if name:
        query = query.ilike("business_name", f"%{name}%")
    return query

@router.get("")
def get_leads(
    search_id: Optional[str] = None, status: Optional[str] = None,
    is_favorite: Optional[bool] = None, has_website: Optional[bool] = None,
    name: Optional[str] = None, sort_by: str = "date", sort_dir: str = "desc",
    page: int = 1, per_page: int = 25
):
    query = supabase.table("leads").select("*", count="exact")
    query = apply_filters(query, search_id, status, is_favorite, has_website, name)
    
    sort_column = "created_at"
    if sort_by == "rating": sort_column = "rating"
    elif sort_by == "reviews": sort_column = "total_reviews"
    elif sort_by == "name": sort_column = "business_name"
    
    query = query.order(sort_column, desc=(sort_dir == "desc"))
    
    start = (page - 1) * per_page
    end = start + per_page - 1
    query = query.range(start, end)
    
    response = query.execute()
    
    return {
        "data": response.data,
        "total": response.count,
        "page": page,
        "per_page": per_page
    }

@router.get("/export")
def export_leads(
    search_id: Optional[str] = None, status: Optional[str] = None,
    is_favorite: Optional[bool] = None, has_website: Optional[bool] = None,
    name: Optional[str] = None
):
    query = supabase.table("leads").select("*")
    query = apply_filters(query, search_id, status, is_favorite, has_website, name)
    response = query.execute()
    
    csv_content = generate_csv(response.data)
    
    import datetime
    
    niche = "all"
    location = "all"
    
    if search_id:
        search_res = supabase.table("searches").select("niche, location").eq("id", search_id).execute()
        if search_res.data:
            niche = search_res.data[0]["niche"].replace(" ", "_")
            location = search_res.data[0]["location"].replace(" ", "_")
            
    date_str = datetime.datetime.now().strftime("%Y-%m-%d")
    filename = f"leads_{niche}_{location}_{date_str}.csv"
    
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{id}")
def get_lead(id: str):
    response = supabase.table("leads").select("*").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return response.data[0]

@router.patch("/{id}")
def update_lead(id: str, lead: LeadUpdate):
    update_data = {k: v for k, v in lead.model_dump().items() if v is not None}
    if not update_data:
        return supabase.table("leads").select("*").eq("id", id).execute().data[0]
        
    response = supabase.table("leads").update(update_data).eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Lead not found")
    return response.data[0]
