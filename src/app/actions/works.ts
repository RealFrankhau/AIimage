'use server';

import { createClient } from '@/lib/supabase/server';
import { uploadImage, deleteImage, getImageDimensions } from '@/lib/storage';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { CreateWorkInput, UpdateWorkInput } from '@/types';

export async function createWorkAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  const allowedEmail = process.env.ALLOWED_EMAIL?.toLowerCase();
  if (user.email?.toLowerCase() !== allowedEmail) {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title') as string;
  const prompt = formData.get('prompt') as string;
  const negative_prompt = formData.get('negative_prompt') as string || undefined;
  const ai_tool = formData.get('ai_tool') as string || undefined;
  const model_name = formData.get('model_name') as string || undefined;
  const style = formData.get('style') as string || undefined;
  const category_id = formData.get('category_id') as string || undefined;
  const tags = formData.get('tags') as string || '';
  const image_width = formData.get('image_width') ? parseInt(formData.get('image_width') as string) : undefined;
  const image_height = formData.get('image_height') ? parseInt(formData.get('image_height') as string) : undefined;
  const aspect_ratio = formData.get('aspect_ratio') as string || undefined;
  const seed = formData.get('seed') as string || undefined;
  const parameters = formData.get('parameters') as string || undefined;
  const notes = formData.get('notes') as string || undefined;
  const created_at = formData.get('created_at') as string || new Date().toISOString();

  const imageFile = formData.get('image') as File;

  if (!title || !prompt || !imageFile || imageFile.size === 0) {
    return { error: 'Title, prompt, and image are required' };
  }

  // Upload image
  const { path: imagePath, error: uploadError } = await uploadImage(imageFile, user.id);
  if (uploadError || !imagePath) {
    return { error: uploadError || 'Failed to upload image' };
  }

  // Get image dimensions if not provided
  let width = image_width;
  let height = image_height;
  if (!width || !height) {
    try {
      const dims = await getImageDimensions(imageFile);
      width = width || dims.width;
      height = height || dims.height;
    } catch {
      // Ignore dimension errors
    }
  }

  // Parse tags
  const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

  // Parse parameters
  let paramsObj: Record<string, unknown> | undefined = undefined;
  if (parameters) {
    try {
      paramsObj = JSON.parse(parameters);
    } catch {
      // Ignore parse errors
    }
  }

  const workData: CreateWorkInput = {
    title,
    prompt,
    negative_prompt,
    image_path: imagePath,
    ai_tool,
    model_name,
    style,
    category_id: category_id || undefined,
    tags: tagArray,
    image_width: width,
    image_height: height,
    aspect_ratio: aspect_ratio || (width && height ? `${width}:${height}` : undefined),
    seed,
    parameters: paramsObj,
    notes,
  };

  const { data, error } = await supabase
    .from('works')
    .insert({
      ...workData,
      user_id: user.id,
      created_at,
    })
    .select()
    .single();

  if (error) {
    // Clean up uploaded image on failure
    await deleteImage(imagePath);
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  redirect(`/work/${data.id}`);
}

export async function updateWorkAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const prompt = formData.get('prompt') as string;
  const negative_prompt = formData.get('negative_prompt') as string || undefined;
  const ai_tool = formData.get('ai_tool') as string || undefined;
  const model_name = formData.get('model_name') as string || undefined;
  const style = formData.get('style') as string || undefined;
  const category_id = formData.get('category_id') as string || undefined;
  const tags = formData.get('tags') as string || '';
  const image_width = formData.get('image_width') ? parseInt(formData.get('image_width') as string) : undefined;
  const image_height = formData.get('image_height') ? parseInt(formData.get('image_height') as string) : undefined;
  const aspect_ratio = formData.get('aspect_ratio') as string || undefined;
  const seed = formData.get('seed') as string || undefined;
  const parameters = formData.get('parameters') as string || undefined;
  const notes = formData.get('notes') as string || undefined;

  const imageFile = formData.get('image') as File | null;

  if (!id || !title || !prompt) {
    return { error: 'ID, title, and prompt are required' };
  }

  // Get current work to check ownership and get old image path
  const { data: currentWork, error: fetchError } = await supabase
    .from('works')
    .select('image_path, user_id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !currentWork) {
    return { error: 'Work not found' };
  }

  let imagePath = currentWork.image_path;

  // Upload new image if provided
  if (imageFile && imageFile.size > 0) {
    const { path: newImagePath, error: uploadError } = await uploadImage(imageFile, user.id);
    if (uploadError || !newImagePath) {
      return { error: uploadError || 'Failed to upload image' };
    }
    imagePath = newImagePath;
  }

  // Parse tags
  const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);

  // Parse parameters
  let paramsObj: Record<string, unknown> | undefined = undefined;
  if (parameters) {
    try {
      paramsObj = JSON.parse(parameters);
    } catch {
      // Ignore parse errors
    }
  }

  const updateData: UpdateWorkInput = {
    id,
    title,
    prompt,
    negative_prompt,
    image_path: imagePath,
    ai_tool,
    model_name,
    style,
    category_id: category_id || undefined,
    tags: tagArray,
    image_width,
    image_height,
    aspect_ratio,
    seed,
    parameters: paramsObj,
    notes,
  };

  const { error } = await supabase
    .from('works')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    // Clean up new image on failure
    if (imageFile && imageFile.size > 0 && imagePath !== currentWork.image_path) {
      await deleteImage(imagePath);
    }
    return { error: error.message };
  }

  // Delete old image if replaced
  if (imageFile && imageFile.size > 0 && imagePath !== currentWork.image_path) {
    await deleteImage(currentWork.image_path);
  }

  revalidatePath('/dashboard');
  revalidatePath(`/work/${id}`);
  redirect(`/work/${id}`);
}

export async function deleteWorkAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  // Get work to find image path
  const { data: work, error: fetchError } = await supabase
    .from('works')
    .select('image_path')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !work) {
    return { error: 'Work not found' };
  }

  // Delete work record
  const { error } = await supabase
    .from('works')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  // Delete image from storage
  if (work.image_path) {
    await deleteImage(work.image_path);
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function toggleFavoriteAction(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { error: 'Unauthorized' };

  const { data: work, error: fetchError } = await supabase
    .from('works')
    .select('is_favorite')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !work) {
    return { error: 'Work not found' };
  }

  const { error } = await supabase
    .from('works')
    .update({ 
      is_favorite: !work.is_favorite,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/work/${id}`);
  return { success: true };
}