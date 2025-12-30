
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

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
 * فشرده‌سازی تصویر با استفاده از Canvas قبل از آپلود
 * این کار حجم تصاویر را تا ۹۰٪ کاهش می‌دهد بدون افت کیفیت محسوس در موبایل
 */
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // رزولوشن حداکثر ۱۰۰۰ پیکسل برای سرعت بیشتر
        const MAX_SIZE = 1000;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.5); // کیفیت ۵۰ درصد برای سبک‌ترین حالت ممکن
      };
    };
  });
};

export const uploadImage = async (file: File): Promise<string> => {
  if (!isConfigured) return URL.createObjectURL(file);

  const compressedFile = await compressImage(file);
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
  
  const { error } = await supabase.storage
    .from('images')
    .upload(fileName, compressedFile);

  if (error) throw error;

  const { data } = supabase.storage.from('images').getPublicUrl(fileName);
  return data.publicUrl;
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  return Promise.all(files.map(file => uploadImage(file)));
};
