import os
import subprocess
import tempfile
import json

def test_scrape():
    scraper_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "google-maps-scraper")
    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt") as q_file:
        q_file.write("Plumbers in NY")
        q_file_path = q_file.name

    with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".json") as r_file:
        r_file_path = r_file.name

    command = [
        "go", "run", "main.go",
        "-input", q_file_path,
        "-results", r_file_path,
        "-json",
        "-depth", "1"
    ]
    process = subprocess.Popen(command, cwd=scraper_dir, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
    out, err = process.communicate()
    
    with open(r_file_path, 'r', encoding='utf-8') as f:
        print(f.read()[:1000])

test_scrape()
