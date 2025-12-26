
import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, User, Key } from 'lucide-react';
import { AdminUser } from '../types';

interface AdminLoginProps {
  admins: AdminUser[];
  onLogin: (user: AdminUser) => void;
  onCancel: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ admins, onLogin, onCancel }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = admins.find(a => a.username === username && a.password === password);
    
    if (admin) {
      onLogin(admin);
    } else {
      setError('نام کاربری یا رمز عبور اشتباه است.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-[Vazirmatn]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gray-800 p-8 text-center relative">
           <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-gray-600 shadow-lg">
             <ShieldCheck size={40} className="text-red-500" />
           </div>
           <h2 className="text-2xl font-bold text-white">ورود به پنل مدیریت</h2>
           <p className="text-gray-400 text-sm mt-2">لطفاً اطلاعات امنیتی خود را وارد کنید</p>
           
           <button 
             onClick={onCancel}
             className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
             title="بازگشت به سایت"
           >
             <ArrowRight size={20} />
           </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-bold border border-red-100">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">نام کاربری</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-gray-800 focus:ring-2 focus:ring-red-500 outline-none transition-all dir-ltr text-left"
                  placeholder="admin"
                  required
                />
                <User size={18} className="absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1">رمز عبور</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-gray-800 focus:ring-2 focus:ring-red-500 outline-none transition-all dir-ltr text-left"
                  placeholder="••••••"
                  required
                />
                <Key size={18} className="absolute right-3 top-3.5 text-gray-400" />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              ورود امن
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-6">
            دسترسی فقط برای پرسونل مجاز امکان‌پذیر است.
            <br />
            تلاش‌های ناموفق ثبت خواهد شد.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
