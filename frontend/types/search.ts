export enum SearchStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIAL = 'partial',
  CANCELLED = 'cancelled'
}

export interface Search {
  id: string;
  niche: string;
  location: string;
  status: SearchStatus | string;
  progress_percent: number;
  message?: string;
  total_results: number;
  leads_collected: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface SearchCreate {
  niche: string;
  location: string;
}
