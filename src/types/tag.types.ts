export interface Tag {
  name: string;
  color: string;
  id: number;
  user_id: number;
  created_at: string;
  link_count: number;
}

export interface TagsResponse {
  items: Tag[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
}

export interface TagsQueryParams {
  sort_by?: string;
  sort_desc?: boolean;
  skip?: number;
  limit?: number;
} 