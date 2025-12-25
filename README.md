
# Afghan Estate & Jobs Platform

## راهنمای راه‌اندازی نهایی (Deployment Guide)

### ۱. ساخت بک‌ند (Backend) در Supabase
1. به سایت [database.new](https://database.new) بروید و یک پروژه جدید بسازید.
2. در بخش **Table Editor**، جدول‌های `properties`, `jobs`, `services` را بسازید.
3. در بخش **Authentication**، ورود با ایمیل یا تلفن را فعال کنید.
4. در بخش **Storage**، یک باکت جدید به نام `images` بسازید و آن را Public کنید.

### ۲. اتصال به پروژه
1. فایل `.env` را در روت پروژه بسازید.
2. مقادیر زیر را از تنظیمات Supabase کپی کنید:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### ۳. انتشار آنلاین (Deploy)
1. کدها را در GitHub آپلود کنید.
2. در سایت [Vercel.com](https://vercel.com) ثبت نام کنید.
3. پروژه GitHub خود را ایمپورت کنید.
4. دکمه Deploy را بزنید.
