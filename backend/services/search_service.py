import asyncio
from datetime import datetime, timezone
from database import supabase
from services.scraper_service import scrape_google_maps

async def run_search_task(search_id: str):
    try:
        # Update status to 'running'
        supabase.table("searches").update({"status": "running"}).eq("id", search_id).execute()
        
        async def do_scrape():
            loop = asyncio.get_event_loop()
            search = supabase.table("searches").select("*").eq("id", search_id).execute().data[0]
            niche = search["niche"]
            location = search["location"]
            
            # Using run_in_executor for blocking call
            return await loop.run_in_executor(None, scrape_google_maps, niche, location)

        async def update_progress():
            progress = 0
            while progress < 90:
                await asyncio.sleep(2)
                progress += 1
                supabase.table("searches").update({
                    "progress_percent": progress,
                    "message": f"Scraping... ({progress}%)"
                }).eq("id", search_id).execute()

        progress_task = asyncio.create_task(update_progress())
        results = await asyncio.wait_for(do_scrape(), timeout=600.0)
        progress_task.cancel()
        
        search = supabase.table("searches").select("*").eq("id", search_id).execute().data[0]
        if search["status"] == "cancelled":
            return
            
        leads_collected = 0
        total = len(results)
        
        for i, res in enumerate(results):
            # Check cancellation
            search_check = supabase.table("searches").select("status").eq("id", search_id).execute().data[0]
            if search_check["status"] == "cancelled":
                break
                
            # Check duplicate
            existing = supabase.table("leads").select("id").eq("google_key", res["google_key"]).execute().data
            if not existing:
                res["search_id"] = search_id
                supabase.table("leads").insert(res).execute()
                leads_collected += 1
            
            progress = int(((i + 1) / total) * 100) if total > 0 else 100
            supabase.table("searches").update({
                "leads_collected": leads_collected,
                "progress_percent": progress,
                "message": f"Collected {leads_collected} leads"
            }).eq("id", search_id).execute()

        # Final completion
        search_check = supabase.table("searches").select("status").eq("id", search_id).execute().data[0]
        if search_check["status"] != "cancelled":
            supabase.table("searches").update({
                "status": "completed",
                "total_results": total,
                "progress_percent": 100,
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "message": "Search completed successfully"
            }).eq("id", search_id).execute()

    except asyncio.TimeoutError:
        # On timeout
        search = supabase.table("searches").select("leads_collected").eq("id", search_id).execute().data[0]
        supabase.table("searches").update({
            "status": "partial",
            "message": f"Timed out. {search.get('leads_collected', 0)} results saved."
        }).eq("id", search_id).execute()
    except Exception as e:
        # On error
        supabase.table("searches").update({
            "status": "failed",
            "error_message": str(e)
        }).eq("id", search_id).execute()
