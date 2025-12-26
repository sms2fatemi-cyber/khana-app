<<<<<<< HEAD
=======

>>>>>>> 057bd739726c00a660ae5bd07419e65dcfb5d9ca
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
<<<<<<< HEAD
  // Fix: Property 'cwd' does not exist on type 'Process'. Casting process to any to access Node.js cwd method in Vite config.
  const env = loadEnv(mode, (process as any).cwd(), '');
=======
  // بارگذاری متغیرها از فایل .env یا محیط سیستم (Vercel)
  const env = loadEnv(mode, process.cwd(), '');
>>>>>>> 057bd739726c00a660ae5bd07419e65dcfb5d9ca
  
  return {
    plugins: [react()],
    define: {
<<<<<<< HEAD
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || env.SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || ''),
=======
      // تزریق متغیرها به کد فرانت‌بند در زمان Build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
>>>>>>> 057bd739726c00a660ae5bd07419e65dcfb5d9ca
    },
    server: {
      port: 3000,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'leaflet', 'react-leaflet'],
          },
        },
      },
    },
  };
<<<<<<< HEAD
});
=======
});
>>>>>>> 057bd739726c00a660ae5bd07419e65dcfb5d9ca
