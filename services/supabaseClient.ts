
import { createClient } from '@supabase/supabase-js';

// Fix: Using process.env instead of import.meta.env to resolve TypeScript errors and align with project configuration
const supabaseUrl = (process.env as any).VITE_SUPABASE_URL || '';
const supabaseAnonKey = (process.env as any).VITE_SUPABASE_ANON_KEY || '';

// بررسی اینکه آیا آدرس معتبر است یا خیر
const isConfigured = supabaseUrl && supabaseUrl.startsWith('https://');

export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder'
);

export const TABLES = {
  PROPERTIES: 'properties',
  JOBS: 'jobs',
  SERVICES: 'services'
};

export const isSupabaseReady = () => isConfigured;

/**
 * آپلود یک فایل در باکت images
 */
export const uploadImage = async (file: File): Promise<string> => {
  if (!isConfigured) {
    console.error("Supabase is not configured properly.");
    throw new Error("تنظیمات دیتابیس ست نشده است.");
  }

  const bucketName = 'images'; 
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error("Storage Error:", uploadError);
    throw new Error(`خطای آپلود: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);
  return data.publicUrl;
};

/**
 * آپلود چندین فایل به صورت همزمان
 */
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) return [];
  const uploadPromises = files.map(file => uploadImage(file));
  return Promise.all(uploadPromises);
};
