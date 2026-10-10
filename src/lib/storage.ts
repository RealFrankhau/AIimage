import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/server';
import { validateImageFile } from '@/utils/helpers';

const BUCKET_NAME = 'works';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function uploadImage(file: File, userId: string): Promise<{ path: string; error?: string }> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { path: '', error: validation.error };
  }

  const supabase = await createServiceClient();
  
  // Generate unique file path
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    return { path: '', error: uploadError.message };
  }

  return { path: filePath };
}

export async function deleteImage(path: string): Promise<{ error?: string }> {
  const supabase = await createServiceClient();
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path]);

  if (error) {
    return { error: error.message };
  }

  return {};
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<{ url: string; error?: string }> {
  const supabase = await createClient();
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(path, expiresIn);

  if (error || !data?.signedUrl) {
    return { url: '', error: error?.message || 'Failed to create signed URL' };
  }

  return { url: data.signedUrl };
}

export async function getPublicUrl(path: string): Promise<string> {
  const supabase = await createClient();
  
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}