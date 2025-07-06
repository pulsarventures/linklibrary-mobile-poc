export interface Collection {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  is_favorite: boolean;
  is_archived: boolean;
  is_default: boolean;
  link_count: number;
  created_at: string;
  updated_at: string;
  sort_order?: number;
  user_id?: number;
}

export interface CollectionFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface CollectionQueryParams {
  skip?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_desc?: boolean;
}

export interface CollectionsResponse {
  items: Collection[];
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
} 