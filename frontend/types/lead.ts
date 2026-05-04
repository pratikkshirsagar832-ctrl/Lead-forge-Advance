export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  REJECTED = 'rejected'
}

export interface Lead {
  id: string;
  search_id: string;
  google_key: string;
  business_name: string;
  category?: string;
  full_address?: string;
  phone?: string;
  website_url?: string;
  rating?: number;
  total_reviews?: number;
  google_maps_link?: string;
  is_favorite: boolean;
  user_notes?: string;
  user_status: LeadStatus | string;
  created_at: string;
}

export interface LeadFilter {
  search_id?: string;
  status?: string;
  is_favorite?: boolean;
  has_website?: boolean;
  name?: string;
  sort_by?: string;
  sort_dir?: string;
  page: number;
  per_page: number;
}
