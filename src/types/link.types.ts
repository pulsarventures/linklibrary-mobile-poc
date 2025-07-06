export interface Link {
  id: string;
  url: string;
  title: string;
  summary?: string;
  notes: string | null;
  thumbnail_url: string | null;
  favicon_url: string | null;
  input_source: string | null;
  source_name: string | null;
  content_type?: string;
  estimated_read_time: number | null;
  collection_id: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_read: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
  last_accessed: string | null;
  tag_ids: string[];
} 