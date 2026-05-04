-- Create searches table
CREATE TABLE searches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    niche TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL,
    progress_percent INTEGER DEFAULT 0,
    message TEXT,
    total_results INTEGER DEFAULT 0,
    leads_collected INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Create leads table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id UUID REFERENCES searches(id) ON DELETE CASCADE,
    google_key TEXT UNIQUE NOT NULL,
    business_name TEXT NOT NULL,
    category TEXT,
    full_address TEXT,
    phone TEXT,
    website_url TEXT,
    rating NUMERIC(2,1),
    total_reviews INTEGER,
    google_maps_link TEXT,
    is_favorite BOOLEAN DEFAULT false,
    user_notes TEXT DEFAULT '',
    user_status TEXT DEFAULT 'new',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_leads_search_id ON leads USING btree (search_id);
CREATE UNIQUE INDEX idx_leads_google_key ON leads (google_key);
CREATE INDEX idx_leads_is_favorite ON leads USING btree (is_favorite);
CREATE INDEX idx_leads_user_status ON leads USING btree (user_status);
CREATE INDEX idx_leads_created_at ON leads USING btree (created_at);
CREATE INDEX idx_searches_status ON searches USING btree (status);
CREATE INDEX idx_searches_created_at ON searches USING btree (created_at);

-- RLS Policies
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow full access to service_role (Backend operations)
CREATE POLICY "Service Role Full Access Searches" ON searches FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
CREATE POLICY "Service Role Full Access Leads" ON leads FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Allow read-only access to anon (Frontend operations, if needed)
CREATE POLICY "Anon Read Access Searches" ON searches FOR SELECT USING (true);
CREATE POLICY "Anon Read Access Leads" ON leads FOR SELECT USING (true);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_modtime
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
