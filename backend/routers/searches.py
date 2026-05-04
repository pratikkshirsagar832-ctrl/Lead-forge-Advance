from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from models.search import SearchCreate, SearchResponse, SearchProgress
from database import supabase
from services.search_service import run_search_task
from auth import get_current_user
from typing import List

router = APIRouter(prefix="/api/searches", tags=["searches"], dependencies=[Depends(get_current_user)])

@router.post("", response_model=SearchResponse)
def create_search(search: SearchCreate, background_tasks: BackgroundTasks):
    if not search.niche or not search.location:
        raise HTTPException(status_code=400, detail="Niche and location cannot be empty")
        
    data = supabase.table("searches").insert({
        "niche": search.niche,
        "location": search.location,
        "status": "queued"
    }).execute().data[0]
    
    background_tasks.add_task(run_search_task, data["id"])
    return data

@router.get("", response_model=dict)
def get_searches():
    response = supabase.table("searches").select("*", count="exact").order("created_at", desc=True).execute()
    return {
        "data": response.data,
        "total": response.count
    }

@router.get("/{id}", response_model=SearchResponse)
def get_search(id: str):
    response = supabase.table("searches").select("*").eq("id", id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Search not found")
    return response.data[0]

@router.post("/{id}/cancel")
def cancel_search(id: str):
    search = supabase.table("searches").select("status").eq("id", id).execute().data
    if not search:
        raise HTTPException(status_code=404, detail="Search not found")
        
    if search[0]["status"] in ["queued", "running"]:
        supabase.table("searches").update({
            "status": "cancelled",
            "message": "Cancelled by user"
        }).eq("id", id).execute()
        return {"status": "success"}
    return {"status": "ignored"}
