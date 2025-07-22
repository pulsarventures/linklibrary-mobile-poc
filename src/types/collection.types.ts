export type Collection = {
  color?: string;
  created_at: string;
  description?: string;
  icon?: string;
  id: number;
  is_archived: boolean;
  is_default: boolean;
  is_favorite: boolean;
  link_count: number;
  name: string;
  sort_order?: number;
  updated_at: string;
  user_id?: number;
}

export type CollectionFormData = {
  color: string;
  description: string;
  icon: string;
  name: string;
}

export type CollectionQueryParams = {
  limit?: number;
  search?: string;
  skip?: number;
  sort_by?: string;
  sort_desc?: boolean;
}

export type CollectionsResponse = {
  has_more: boolean;
  items: Collection[];
  limit: number;
  skip: number;
  total: number;
} 