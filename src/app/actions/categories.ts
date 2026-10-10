'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createCategoryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  const name = formData.get('name') as string;

  if (!name || !name.trim()) {
    return { error: 'Category name is required' };
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ name: name.trim(), user_id: user.id })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/work/new');
  revalidatePath('/work/[id]/edit');
  return { success: true, data };
}

export async function updateCategoryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  const id = formData.get('id') as string;
  const name = formData.get('name') as string;

  if (!id || !name || !name.trim()) {
    return { error: 'ID and name are required' };
  }

  const { data, error } = await supabase
    .from('categories')
    .update({ name: name.trim() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/work/new');
  revalidatePath('/work/[id]/edit');
  return { success: true, data };
}

export async function deleteCategoryAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  const id = formData.get('id') as string;

  if (!id) {
    return { error: 'ID is required' };
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/settings');
  revalidatePath('/work/new');
  revalidatePath('/work/[id]/edit');
  return { success: true };
}