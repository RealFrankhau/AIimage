export interface Work {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  negative_prompt: string | null;
  image_path: string;
  ai_tool: string | null;
  model_name: string | null;
  style: string | null;
  category_id: string | null;
  tags: string[];
  image_width: number | null;
  image_height: number | null;
  aspect_ratio: string | null;
  seed: string | null;
  parameters: Record<string, unknown> | null;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  category?: Category | null;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface WorkWithCategory extends Work {
  category: Category | null;
}

export interface CreateWorkInput {
  title: string;
  prompt: string;
  negative_prompt?: string;
  image_path: string;
  ai_tool?: string;
  model_name?: string;
  style?: string;
  category_id?: string;
  tags?: string[];
  image_width?: number;
  image_height?: number;
  aspect_ratio?: string;
  seed?: string;
  parameters?: Record<string, unknown>;
  notes?: string;
}

export interface UpdateWorkInput extends Partial<CreateWorkInput> {
  id: string;
}

export interface SearchFilters {
  query?: string;
  category_id?: string;
  ai_tool?: string;
  style?: string;
  tags?: string[];
  is_favorite?: boolean;
  sort_by?: 'created_at' | 'updated_at' | 'title';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}