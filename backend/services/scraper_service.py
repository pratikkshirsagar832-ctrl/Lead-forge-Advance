import subprocess
import json
import os
import uuid
import tempfile
from typing import List, Dict, Any

def scrape_google_maps(niche: str, location: str) -> List[Dict[str, Any]]:
    query = f"{niche} in {location}"
    scraper_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "google-maps-scraper")
    
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt") as q_file:
        q_file.write(query)
        q_file_path = q_file.name

    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as r_file:
        r_file_path = r_file.name

    try:
        command = [
            "go", "run", "main.go",
            "-input", q_file_path,
            "-results", r_file_path,
            "-json"
        ]
        
        process = subprocess.Popen(
            command,
            cwd=scraper_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            encoding='utf-8',
            errors='replace'
        )
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"Scraper failed with return code {process.returncode}. Stderr: {stderr}")
            
        results = []
        if os.path.exists(r_file_path):
            with open(r_file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    if line == '[' or line == ']':
                        continue
                    if line.endswith(','):
                        line = line[:-1]
                    try:
                        data = json.loads(line)
                        google_key = data.get("place_id") or data.get("cid") or str(uuid.uuid4())
                        formatted = {
                            "google_key": str(google_key),
                            "business_name": data.get("title", ""),
                            "category": data.get("category", ""),
                            "full_address": data.get("address", ""),
                            "phone": data.get("phone", ""),
                            "website_url": data.get("web_site", ""),
                            "rating": data.get("review_rating"),
                            "total_reviews": data.get("review_count"),
                            "google_maps_link": data.get("link", "")
                        }
                        results.append(formatted)
                    except json.JSONDecodeError:
                        pass
        return results
    finally:
        if os.path.exists(q_file_path):
            os.remove(q_file_path)
        if os.path.exists(r_file_path):
            os.remove(r_file_path)
