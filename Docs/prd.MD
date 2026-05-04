# LeadForge Advance — Product Requirements Document
## Version: 1.0
## Status: Finalized for Build
## Build Type: Internal Tool (Team Use Only)
## Backend Hosting: Render (Free Tier)
## Frontend Hosting: Vercel
## Database: Supabase (MCP-Connected)

---

# 1. Product Summary

LeadForge Advance is a private internal lead generation tool
built exclusively for team use.

It scrapes business data from Google Maps based on
niche + location, collects complete contact information
with international phone numbers, and exports
everything as a clean CSV file.

## What It Does:
- Scrapes Google Maps for business leads
- Collects minimum 100 leads per search (unlimited max)
- Skips duplicate businesses automatically
- Saves all leads to Supabase database
- Displays leads in a premium filtered table
- Exports selected leads as CSV
- Tracks favorites, notes, and custom status per lead

## What It Does NOT Do:
- No website analysis
- No AI pitch generation
- No SaaS features
- No multi-user system
- No payments
- No cron jobs
- No auto-scheduling

---

# 2. Final Locked Architecture

| Component              | Decision                              |
|------------------------|---------------------------------------|
| Frontend Framework     | Next.js 14 (App Router)               |
| Frontend Hosting       | Vercel                                |
| Backend Framework      | FastAPI                               |
| Backend Hosting        | Render (Free Tier)                    |
| Database               | Supabase PostgreSQL                   |
| MCP Connection         | Supabase MCP (all DB operations)      |
| Auth Method            | Hardcoded credentials in .env         |
| Background Processing  | FastAPI BackgroundTasks + asyncio     |
| Concurrency Control    | asyncio.Semaphore                     |
| Data Source            | Google Maps (google-maps-scraper)     |
| Website Analysis       | NONE                                  |
| AI Pitch Generation    | NONE                                  |
| Search Lead Limit      | Minimum 100 / Unlimited max           |
| Duplicate Handling     | Skip duplicates by google_key         |
| Phone Format           | International with country code       |
| Cron Jobs              | NOT REQUIRED                          |
| Manual Trigger         | YES (user-initiated only)             |
| CSV Export             | YES (6 columns)                       |
| Progress Polling       | Every 2 seconds                       |
| Timeout Strategy       | 10 min → partial save + notify        |
| UI Theme               | Animated gradient + Glassmorphism     |
| UI Style               | Premium dark-toned warm palette       |

---

# 3. Core User Flow

Step 1:  User opens app → animated login screen
Step 2:  User enters ID + Password
Step 3:  Backend validates against .env credentials
Step 4:  Token returned → stored in frontend
Step 5:  User lands on Dashboard
Step 6:  User sees stats (total searches, leads, favorites)
Step 7:  User clicks "New Search"
Step 8:  User enters Niche + Location
Step 9:  Backend creates search row (status: queued)
Step 10: BackgroundTask starts scraping Google Maps
Step 11: Frontend polls progress every 2 seconds
Step 12: Progress bar updates in real-time
Step 13: Leads saved to Supabase as they come in
Step 14: Duplicates skipped by google_key check
Step 15: Search completes (or partial on timeout)
Step 16: User sees results table with all leads
Step 17: User filters/sorts leads
Step 18: User clicks lead → detail view opens
Step 19: User adds notes, sets status, marks favorites
Step 20: User clicks Export CSV
Step 21: CSV downloads with 6 columns

---

# 4. Tech Stack

## Backend
| Package                  | Version  | Purpose                        |
|--------------------------|----------|--------------------------------|
| fastapi                  | latest   | API Framework                  |
| uvicorn[standard]        | latest   | ASGI Server                    |
| supabase                 | latest   | Supabase Python Client         |
| google-maps-scraper      | latest   | Google Maps Data Extraction    |
| python-dotenv            | latest   | Environment Variable Loading   |
| python-jose[cryptography]| latest   | JWT Token Generation           |
| passlib[bcrypt]          | latest   | Password Hashing               |
| httpx                    | latest   | Async HTTP Client              |
| pydantic                 | v2       | Data Validation                |
| pydantic-settings        | latest   | Settings Management            |

## Frontend
| Package              | Version  | Purpose                         |
|----------------------|----------|---------------------------------|
| next                 | 14       | Framework (App Router)          |
| react                | 18       | UI Library                      |
| typescript           | latest   | Type Safety                     |
| tailwindcss          | latest   | Styling                         |
| shadcn/ui            | latest   | Component Library               |
| framer-motion        | latest   | Animations                      |
| zustand              | latest   | State Management                |
| axios                | latest   | HTTP Client                     |
| react-hook-form      | latest   | Form Handling                   |
| zod                  | latest   | Schema Validation               |
| @supabase/supabase-js| latest   | Supabase JS Client              |
| lucide-react         | latest   | Icon Library                    |
| react-hot-toast      | latest   | Toast Notifications             |
| date-fns             | latest   | Date Formatting                 |

---

# 5. Authentication

## Credentials (Backend .env Only)
INTERNAL_USER_ID=8766033979
INTERNAL_USER_PASSWORD=Patil@4321

text


## Auth Flow
1. Frontend sends POST /api/auth/login
   Body: { user_id: string, password: string }

2. Backend compares against .env values

3. If match:
   - Generate JWT token (24hr expiry)
   - Return: { token, expires_at }

4. Frontend stores token in:
   - Zustand authStore
   - localStorage (persist across refresh)

5. All protected API calls include:
   - Header: Authorization: Bearer <token>

6. Backend middleware verifies token on every request

## Rules
- Single user only
- No registration endpoint
- No password reset
- No email verification
- Token expires in 24 hours
- Wrong credentials → 401 + clear error message
- Expired token → 401 → redirect to login

---

# 6. Database Schema

## Table: searches

| Column           | Type         | Constraints        | Description              |
|------------------|--------------|--------------------|--------------------------|
| id               | uuid         | PK, default uuid   | Unique search ID         |
| niche            | text         | NOT NULL           | Search niche/keyword     |
| location         | text         | NOT NULL           | Search location          |
| status           | text         | NOT NULL           | queued/running/completed |
|                  |              |                    | /failed/partial/cancelled|
| progress_percent | integer      | default 0          | 0 to 100                 |
| message          | text         |                    | Current status message   |
| total_results    | integer      | default 0          | Final lead count         |
| leads_collected  | integer      | default 0          | Real-time counter        |
| error_message    | text         |                    | Error details if failed  |
| created_at       | timestamptz  | default now()      | Search created time      |
| completed_at     | timestamptz  |                    | Search finished time     |

## Table: leads

| Column          | Type         | Constraints           | Description              |
|-----------------|--------------|-----------------------|--------------------------|
| id              | uuid         | PK, default uuid      | Unique lead ID           |
| search_id       | uuid         | FK → searches.id      | Parent search            |
| google_key      | text         | UNIQUE                | Google Maps unique ID    |
| business_name   | text         | NOT NULL              | Business name            |
| category        | text         |                       | Business category/niche  |
| full_address    | text         |                       | Complete address          |
| phone           | text         |                       | Phone + country code     |
| website_url     | text         |                       | Website URL (nullable)   |
| rating          | numeric(2,1) |                       | Google rating            |
| total_reviews   | integer      |                       | Review count             |
| google_maps_link| text         |                       | Direct Google Maps URL   |
| is_favorite     | boolean      | default false         | Favorite flag            |
| user_notes      | text         | default ''            | User notes               |
| user_status     | text         | default 'new'         | new/contacted/qualified  |
|                 |              |                       | /rejected                |
| created_at      | timestamptz  | default now()         | Lead saved time          |

---

# 7. Supabase MCP Operations

ALL database operations must be performed through
Supabase MCP. No SQLAlchemy. No Alembic. No manual SQL.

## Tables (Create via MCP)
- [ ] searches table
- [ ] leads table

## Indexes (Create via MCP)

| Table    | Column        | Type   | Name                          |
|----------|---------------|--------|-------------------------------|
| leads    | search_id     | btree  | idx_leads_search_id           |
| leads    | google_key    | unique | idx_leads_google_key          |
| leads    | is_favorite   | btree  | idx_leads_is_favorite         |
| leads    | user_status   | btree  | idx_leads_user_status         |
| leads    | created_at    | btree  | idx_leads_created_at          |
| searches | status        | btree  | idx_searches_status           |
| searches | created_at    | btree  | idx_searches_created_at       |

## RLS Policies (Create via MCP)
Since this is an internal tool with backend-controlled access:
- Enable RLS on all tables
- Allow all operations via service role key
- Backend uses SUPABASE_SERVICE_KEY for all DB ops
- No user-level RLS policies needed

## Triggers (Create via MCP)
- updated_at trigger on leads table
- updated_at trigger on searches table

---

# 8. Search Lifecycle

## Status Flow
queued → running → completed
→ failed
→ partial
→ cancelled

text


## queued
- Search row created
- progress_percent = 0
- message = "Search queued..."

## running
- BackgroundTask starts
- Scraper begins
- progress_percent updates incrementally
- leads_collected updates in real-time
- message = "Scraping Google Maps... X leads found"

## completed
- All scraping done
- total_results = final count
- progress_percent = 100
- completed_at = now()
- message = "Completed. X leads found."

## failed
- Real error occurred (scraper crash, network issue)
- error_message = detailed error
- message = "Search failed. Please retry."

## partial
- 10 minute timeout hit
- Save whatever leads collected
- message = "Timed out. X partial results saved. Retry?"

## cancelled
- User clicked cancel
- Save whatever collected so far
- message = "Cancelled. X leads saved."

---

# 9. Scraper Rules

## Lead Collection
- Use google-maps-scraper library
- Target: minimum 100 leads per search
- Maximum: unlimited (scrape everything available)
- If only 40 results exist → save all 40, no error
- Never fail just because count is below 100

## Duplicate Handling
- Before saving each lead:
  Check if google_key exists in leads table
- If exists → SKIP (do not save)
- If not exists → SAVE
- Log skipped count for debugging

## Phone Number Format
- Must include country code
- Format: +[country_code][number]
- Example: +91 98765 43210 (India)
- Example: +1 555 123 4567 (USA)
- Example: +44 7911 123456 (UK)
- If phone not available → store null

## Data to Collect Per Lead
- business_name (required)
- category (niche)
- full_address (complete with city, country)
- phone (with country code)
- website_url (nullable)
- rating (nullable)
- total_reviews (nullable)
- google_maps_link (direct URL)
- google_key (unique Google identifier)

---

# 10. Progress Polling

## Frontend Behavior
- After search created → start polling
- Poll endpoint: GET /api/searches/{id}
- Interval: every 2000ms (2 seconds)
- Stop polling when:
  status === 'completed' OR
  status === 'failed' OR
  status === 'partial' OR
  status === 'cancelled'

## Progress Display
- Show progress bar (0-100%)
- Show current message
- Show leads_collected count live
- Show cancel button while status === 'running'
- Show retry option when status === 'failed'

---

# 11. CSV Export

## Trigger
- Button: "Export CSV" on results page
- Exports currently filtered/visible leads
- If no filter → exports all leads from search

## Columns (Exact Order)
Column 1: Business Name
Column 2: Phone
Column 3: Website URL
Column 4: Full Address
Column 5: Category
Column 6: Google Maps Link

text


## File Rules
- Filename: leads_{niche}_{location}_{YYYY-MM-DD}.csv
- Encoding: UTF-8 with BOM (for Excel compatibility)
- Handle commas in addresses (wrap in quotes)
- Handle null values (empty cell, not "null" string)
- Spaces replaced with underscores in filename

## Example Output
Business Name,Phone,Website URL,Full Address,Category,Google Maps Link
"Pizza Palace","+1 555 123 4567","https://pizzapalace.com",
"123 Main St, New York, NY 10001","Restaurant",
"https://maps.google.com/?cid=123456"

text


---

# 12. Frontend Requirements

## Color Palette
| Variable         | Hex Value  | Usage                    |
|------------------|------------|--------------------------|
| --color-darkest  | #3A2D28    | Primary bg, headers      |
| --color-dark     | #A48374    | Accents, buttons         |
| --color-mid      | #CBAD8D    | Highlights, hover states |
| --color-light    | #D1C7BD    | Card borders, dividers   |
| --color-lighter  | #EBE3DB    | Card backgrounds         |
| --color-lightest | #F1EDE6    | Input backgrounds        |

## Animated Background
Combine ALL THREE for maximum premium feel:

### Layer 1: Flowing Gradient
- Slow-moving gradient using #3A2D28 → #A48374 → #CBAD8D
- Animation duration: 8-12 seconds
- Smooth infinite loop
- CSS @keyframes or Framer Motion

### Layer 2: Glassmorphism Cards
- backdrop-filter: blur(20px)
- background: rgba(255,255,255,0.08)
- border: 1px solid rgba(203,173,141,0.2)
- box-shadow: 0 8px 32px rgba(58,45,40,0.3)
- All cards, modals, panels use this style

### Layer 3: Particle Effect
- Subtle floating particles
- Color: #CBAD8D with low opacity (0.3-0.5)
- Size: 2-4px dots
- Slow upward drift animation
- 30-50 particles on screen

## Pages & Components Required

### 1. Login Page
Components:
- Animated background (all 3 layers)
- Centered glassmorphism card
- Logo / App name "LeadForge Advance"
- User ID input field
- Password input field (show/hide toggle)
- Login button with loading spinner
- Error message display
- Subtle entrance animation (Framer Motion)

### 2. Dashboard Page
Components:
- Top navbar (app name, logout button)
- Stats row:
  - Total Searches card
  - Total Leads card
  - Favorites card
  - This Week Leads card
- Recent Searches list (last 10)
  - Search niche + location
  - Status badge (color-coded)
  - Lead count
  - Date
  - Click to view results
- "New Search" button (prominent, animated)
- All cards: glassmorphism style

### 3. New Search Modal/Page
Components:
- Niche input (text, required)
  Placeholder: "e.g. Pizza Restaurant, Dentist, Gym"
- Location input (text, required)
  Placeholder: "e.g. New York, London, Mumbai"
- Start Search button
- Cancel button
- Validation errors inline

### 4. Search Progress Page
Components:
- Search info (niche + location)
- Animated progress bar
- Progress percentage
- Live message text
- Leads collected counter (animates as it increases)
- Cancel button (visible only when running)
- Auto-redirect to results when complete
- Error state with retry button
- Partial state with "View Results" button

### 5. Results Page / Leads Table
Components:
- Search info header (niche, location, total count)
- Filter bar:
  - Filter by: user_status (All/New/Contacted/Qualified/Rejected)
  - Filter by: is_favorite (All/Favorites)
  - Filter by: has_website (All/Has Website/No Website)
  - Search by name (text input)
  - Sort by: rating, reviews, name, date
- Results count display
- Export CSV button (top right, always visible)
- Leads table with columns:
  - Business Name
  - Category
  - Phone
  - Address
  - Rating
  - Website (icon link)
  - Maps (icon link)
  - Status badge
  - Favorite icon (toggle)
  - Actions (view detail)
- Pagination (25 per page)
- Empty state illustration

### 6. Lead Detail View (Slide-over panel or Modal)
Components:
- Business name (large)
- Category badge
- All lead information displayed:
  - Phone (clickable tel: link)
  - Website (clickable, opens new tab)
  - Full address
  - Rating + review count
  - Google Maps link button
- Favorite toggle button
- Status dropdown:
  Options: New / Contacted / Qualified / Rejected
- Notes textarea:
  - Auto-save on blur
  - Character count
- Close button
- Smooth slide-in animation

### 7. Navigation
Components:
- Top navbar:
  - Logo/App name (left)
  - Dashboard link
  - Searches link
  - Logout button (right)
- Breadcrumbs where needed
- Mobile-responsive (hamburger menu)

---

# 13. State Management (Zustand)

## authStore
```typescript
interface AuthStore {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}
searchStore
TypeScript

interface SearchStore {
  currentSearch: Search | null
  searches: Search[]
  isPolling: boolean
  setCurrentSearch: (search: Search) => void
  updateProgress: (data: ProgressData) => void
  startPolling: (searchId: string) => void
  stopPolling: () => void
}
leadsStore
TypeScript

interface LeadsStore {
  leads: Lead[]
  filteredLeads: Lead[]
  filters: FilterState
  pagination: PaginationState
  setLeads: (leads: Lead[]) => void
  updateLead: (id: string, data: Partial<Lead>) => void
  setFilter: (filter: Partial<FilterState>) => void
  exportCSV: () => void
}
uiStore
TypeScript

interface UIStore {
  isNewSearchOpen: boolean
  selectedLead: Lead | null
  isLeadDetailOpen: boolean
  openLeadDetail: (lead: Lead) => void
  closeLeadDetail: () => void
}
14. API Endpoints
Authentication
text

POST   /api/auth/login
Body:  { user_id: string, password: string }
Res:   { token: string, expires_at: string }
Searches
text

POST   /api/searches
Auth:  Required
Body:  { niche: string, location: string }
Res:   { id: string, status: string, created_at: string }

GET    /api/searches
Auth:  Required
Res:   { searches: Search[], total: number }

GET    /api/searches/{id}
Auth:  Required
Res:   { search: Search }  (includes progress)

POST   /api/searches/{id}/cancel
Auth:  Required
Res:   { success: boolean, message: string }
Leads
text

GET    /api/leads
Auth:  Required
Query: search_id, status, is_favorite, has_website,
       name, sort_by, sort_dir, page, per_page
Res:   { leads: Lead[], total: number, page: number }

GET    /api/leads/{id}
Auth:  Required
Res:   { lead: Lead }

PATCH  /api/leads/{id}
Auth:  Required
Body:  { is_favorite?, user_status?, user_notes? }
Res:   { lead: Lead }

GET    /api/leads/export
Auth:  Required
Query: search_id, status, is_favorite (filters)
Res:   CSV file download
Dashboard
text

GET    /api/dashboard/stats
Auth:  Required
Res:   {
         total_searches: number,
         total_leads: number,
         total_favorites: number,
         leads_this_week: number,
         recent_searches: Search[]
       }
15. Error Handling
Backend Rules
No silent failures ever
All exceptions caught and logged
Return structured error: { error: string, detail: string }
Scraper crash → search marked failed + error_message saved
Timeout → search marked partial + partial results saved
Duplicate → silently skipped (not an error, log only)
Frontend Rules
All API errors caught with try/catch
Toast notifications for user-facing errors
Form validation before submission (Zod)
Loading states on all async actions
Network error handling with retry option
401 → auto logout + redirect to login
HTTP Status Codes
Code	Meaning
200	Success
201	Created
400	Bad request (validation error)
401	Unauthorized
404	Not found
422	Unprocessable entity
500	Internal server error
16. Environment Variables
Backend (.env)
env

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Internal Auth
INTERNAL_USER_ID=8766033979
INTERNAL_USER_PASSWORD=Patil@4321

# JWT
SECRET_KEY=your_random_secret_key_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24

# CORS
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app

# App
APP_ENV=production
Frontend (.env.local)
env

NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
17. Project Folder Structure
Backend
text

backend/
├── main.py                    # FastAPI app entry
├── config.py                  # Settings / env
├── auth.py                    # JWT logic
├── database.py                # Supabase client
├── requirements.txt
├── Dockerfile
├── .env
├── routers/
│   ├── auth.py
│   ├── searches.py
│   ├── leads.py
│   └── dashboard.py
├── services/
│   ├── scraper_service.py     # google-maps-scraper
│   ├── search_service.py      # search lifecycle
│   └── export_service.py      # CSV generation
├── models/
│   ├── search.py              # Pydantic models
│   └── lead.py
└── google-maps-scraper/       # Existing folder
Frontend
text

frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx               # Login
│   ├── dashboard/
│   │   └── page.tsx
│   ├── searches/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx       # Progress + Results
│   └── leads/
│       └── [id]/
│           └── page.tsx
├── components/
│   ├── ui/                    # shadcn components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Background.tsx     # Animated bg
│   ├── auth/
│   │   └── LoginForm.tsx
│   ├── dashboard/
│   │   ├── StatsCard.tsx
│   │   └── RecentSearches.tsx
│   ├── search/
│   │   ├── NewSearchForm.tsx
│   │   ├── ProgressBar.tsx
│   │   └── SearchCard.tsx
│   └── leads/
│       ├── LeadsTable.tsx
│       ├── LeadDetail.tsx
│       ├── FilterBar.tsx
│       └── ExportButton.tsx
├── stores/
│   ├── authStore.ts
│   ├── searchStore.ts
│   ├── leadsStore.ts
│   └── uiStore.ts
├── lib/
│   ├── api.ts                 # Axios instance
│   ├── supabase.ts
│   └── utils.ts
├── types/
│   ├── search.ts
│   └── lead.ts
└── hooks/
    ├── usePolling.ts
    └── useLeads.ts
18. Deployment
Backend on Render
Service Type: Web Service
Environment: Python 3.11
Build Command: pip install -r requirements.txt
Start Command: uvicorn main:app --host 0.0.0.0 --port $PORT
Health Check: GET /health
Auto Deploy: Yes (on git push)
Frontend on Vercel
Framework: Next.js (auto-detected)
Build Command: npm run build
Root Directory: frontend/
Environment Variables: Set in Vercel dashboard
Auto Deploy: Yes (on git push)
19. Build Priority Order
Step 1: Database (Supabase MCP)
Create searches table
Create leads table
Create all indexes
Set up RLS
Set up triggers
Verify schema
Step 2: Backend Core
FastAPI setup
Config/settings
Supabase connection
Auth (JWT)
Health check endpoint
Step 3: Backend API
Auth router
Searches router
Leads router
Dashboard router
Step 4: Scraper Integration
google-maps-scraper setup
Search background task
Progress updates
Duplicate check
Lead saving
Step 5: Export
CSV generation service
Export endpoint
Step 6: Frontend Core
Next.js setup
Tailwind + shadcn setup
Animated background component
Zustand stores
Axios instance with interceptors
Step 7: Frontend Pages
Login page
Dashboard page
New search form
Progress page
Results/leads table
Lead detail view
Export button
Step 8: Polish
Error handling everywhere
Loading states
Toast notifications
Responsive design
Final UI polish
20. Final Locked Decisions
#	Decision
1	Internal tool only, no SaaS
2	Next.js 14 frontend → Vercel
3	FastAPI backend → Render free tier
4	Supabase MCP for ALL database operations
5	Hardcoded single-user auth in .env
6	JWT tokens, 24hr expiry
7	Minimum 100 leads per search / unlimited max
8	Duplicates skipped by google_key
9	Phone numbers with international country code
10	NO website analysis
11	NO AI pitch generation
12	CSV export with exactly 6 columns
13	Animated gradient + glassmorphism + particles UI
14	Warm dark color palette (#3A2D28 to #F1EDE6)
15	Framer Motion for all animations
16	Polling every 2 seconds for progress
17	10-minute timeout → partial save
18	Manual trigger only (no cron, no auto)
19	Cancel search → saves partial results
20	Favorites + Notes + Status on every lead
21	Advanced filters on results table
22	Pagination (25 leads per page)
23	Dashboard with 4 stat cards
24	No Redis, no Celery, no Playwright