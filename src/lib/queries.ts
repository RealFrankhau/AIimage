import { createClient } from '@/lib/supabase/server';
import type { Work, Category, CreateWorkInput, UpdateWorkInput, SearchFilters, PaginatedResponse } from '@/types';

const DEFAULT_LIMIT = 24;

export async function getWorks(filters: SearchFilters = {}): Promise<PaginatedResponse<Work>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const {
    query,
    category_id,
    ai_tool,
    style,
    tags,
    is_favorite,
    sort_by = 'created_at',
    sort_order = 'desc',
    page = 1,
    limit = DEFAULT_LIMIT,
  } = filters;

  let queryBuilder = supabase
    .from('works')
    .select(`
      *,
      category:categories(*)
    `, { count: 'exact' })
    .eq('user_id', user.id);

  if (query) {
    queryBuilder = queryBuilder.or(`title.ilike.%${query}%,prompt.ilike.%${query}%,negative_prompt.ilike.%${query}%,tags.cs.{${query}}`);
  }

  if (category_id) {
    queryBuilder = queryBuilder.eq('category_id', category_id);
  }

  if (ai_tool) {
    queryBuilder = queryBuilder.eq('ai_tool', ai_tool);
  }

  if (style) {
    queryBuilder = queryBuilder.eq('style', style);
  }

  if (tags && tags.length > 0) {
    queryBuilder = queryBuilder.contains('tags', tags);
  }

  if (is_favorite !== undefined) {
    queryBuilder = queryBuilder.eq('is_favorite', is_favorite);
  }

  queryBuilder = queryBuilder.order(sort_by, { ascending: sort_order === 'asc' });

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  queryBuilder = queryBuilder.range(from, to);

  const { data, error, count } = await queryBuilder;

  if (error) throw error;

  return {
    data: data || [],
    total: count || 0,
    page,
    limit,
    total_pages: Math.ceil((count || 0) / limit),
  };
}

export async function getWorkById(id: string): Promise<Work | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('works')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export async function createWork(input: CreateWorkInput): Promise<Work> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('works')
    .insert({
      ...input,
      user_id: user.id,
      tags: input.tags || [],
    })
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function updateWork(input: UpdateWorkInput): Promise<Work> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const { id, ...updateData } = input;
  
  const { data, error } = await supabase
    .from('works')
    .update({
      ...updateData,
      tags: updateData.tags || [],
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function deleteWork(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  // First get the work to find the image path
  const { data: work, error: fetchError } = await supabase
    .from('works')
    .select('image_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;

  // Delete the work record
  const { error: deleteError } = await supabase
    .from('works')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) throw deleteError;

  // Delete the image from storage
  if (work?.image_path) {
    await supabase.storage.from('works').remove([work.image_path]);
  }
}

export async function toggleFavorite(id: string): Promise<Work> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  // Get current favorite status
  const { data: work, error: fetchError } = await supabase
    .from('works')
    .select('is_favorite')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('works')
    .update({ 
      is_favorite: !work.is_favorite,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select(`
      *,
      category:categories(*)
    `)
    .single();

  if (error) throw error;
  return data;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createCategory(name: string): Promise<Category> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const { data, error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getUniqueValues(): Promise<{ ai_tools: string[]; styles: string[] }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Unauthorized');

  const [aiToolsResult, stylesResult] = await Promise.all([
    supabase
      .from('works')
      .select('ai_tool')
      .eq('user_id', user.id)
      .not('ai_tool', 'is', null),
    supabase
      .from('works')
      .select('style')
      .eq('user_id', user.id)
      .not('style', 'is', null),
  ]);

  const aiTools = [...new Set(aiToolsResult.data?.map(w => w.ai_tool).filter(Boolean) || [])];
  const styles = [...new Set(stylesResult.data?.map(w => w.style).filter(Boolean) || [])];

  return { ai_tools: aiTools, styles };
}