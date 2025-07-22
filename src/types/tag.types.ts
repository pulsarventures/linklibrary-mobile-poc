export type Tag = {
  color: string;
  created_at: string;
  id: number;
  link_count: number;
  name: string;
  user_id: number;
}

export type TagsQueryParams = {
  limit?: number;
  skip?: number;
  sort_by?: string;
  sort_desc?: boolean;
}

export type TagsResponse = {
  has_more: boolean;
  items: Tag[];
  limit: number;
  skip: number;
  total: number;
} 