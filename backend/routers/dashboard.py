from fastapi import APIRouter, Depends
from auth import get_current_user
from database import supabase
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_user)])

@router.get("/stats")
def get_dashboard_stats():
    # Total searches
    searches_res = supabase.table("searches").select("id", count="exact").execute()
    total_searches = searches_res.count
    
    # Total leads
    leads_res = supabase.table("leads").select("id", count="exact").execute()
    total_leads = leads_res.count
    
    # Total favorites
    favs_res = supabase.table("leads").select("id", count="exact").eq("is_favorite", True).execute()
    total_favorites = favs_res.count
    
    # Leads this week
    seven_days_ago = (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()
    week_res = supabase.table("leads").select("id", count="exact").gte("created_at", seven_days_ago).execute()
    leads_this_week = week_res.count
    
    # Recent searches
    recent = supabase.table("searches").select("*").order("created_at", desc=True).limit(10).execute()
    
    return {
        "total_searches": total_searches,
        "total_leads": total_leads,
        "total_favorites": total_favorites,
        "leads_this_week": leads_this_week,
        "recent_searches": recent.data
    }
