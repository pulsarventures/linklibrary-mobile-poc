export type Link = {
  collection_id: string;
  content_type?: string;
  created_at: string;
  estimated_read_time: null | number;
  favicon_url: null | string;
  id: string;
  input_source: null | string;
  is_archived: boolean;
  is_favorite: boolean;
  is_read: boolean;
  last_accessed: null | string;
  notes: null | string;
  source_name: null | string;
  summary?: string;
  tag_ids: string[];
  thumbnail_url: null | string;
  title: string;
  updated_at: string;
  url: string;
  user_id: string;
} 