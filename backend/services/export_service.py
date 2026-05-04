import csv
import io
from typing import List, Dict, Any

def generate_csv(leads: List[Dict[str, Any]]) -> str:
    output = io.StringIO()
    # Write UTF-8 BOM
    output.write('\ufeff')
    
    writer = csv.writer(output)
    headers = ['Business Name', 'Phone', 'Website URL', 'Full Address', 'Category']
    writer.writerow(headers)
    
    for lead in leads:
        row = [
            lead.get('business_name') or '',
            lead.get('phone') or '',
            lead.get('website_url') or '',
            lead.get('full_address') or '',
            
            lead.get('category') or ''
        ]
        writer.writerow(row)
        
    return output.getvalue()
