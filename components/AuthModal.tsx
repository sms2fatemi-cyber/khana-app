
import React, { useState, useEffect } from 'react';
import { X, List, Heart, LogOut, User, Smartphone, Loader2, Shield } from 'lucide-react';
import { translations } from '../services/translations';

interface AuthModalProps {
  onClose: () => void;
  onShowMyAds: () => void;
  onShowSaved: () => void;
  onAdminClick: () => void;
  lang: 'dari' | 'pashto';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onShowMyAds, onShowSaved, onAdminClick, lang }) => {
  const t = translations[lang];
  const [view, setView] = useState<'login' | 'otp' | 'profile'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedPhone = localStorage.getItem('user_phone');
    if (savedPhone) {
      setView('profile');
      setPhoneNumber(savedPhone);
    }
  }, []);

  const handleSendOtp = () => {
    if (phoneNumber.length < 9) {
      alert(lang === 'dari' ? 'شماره نامعتبر است' : 'شماره سمه نه ده');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setView('otp');
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp === '1234' || otp.length === 4) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        localStorage.setItem('user_phone', phoneNumber);
        setView('profile');
      }, 1000);
    } else {
      alert(lang === 'dari' ? 'کد اشتباه است' : 'کوډ ناسم دی');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_phone');
    setView('login');
  };

  if (view === 'login') {
    return (
      <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-800">{t.login_title}</h2>
            <button onClick={onClose} className="p-2 text-gray-400"><X size={32} /></button>
          </div>
          <div className="space-y-6">
            <div className="relative">
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX" 
                className="w-full bg-gray-100 border-none rounded-2xl pr-12 pl-4 py-4.5 text-lg font-black outline-none focus:ring-2 focus:ring-[#a62626]/20 transition-all text-left dir-ltr"
              />
            </div>
            <button onClick={handleSendOtp} disabled={isLoading} className="w-full bg-[#a62626] text-white py-4.5 rounded-2xl font-black text-lg shadow-xl shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : t.get_code}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'otp') {
    return (
      <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-800">{t.enter_otp}</h2>
            <button onClick={onClose} className="p-2 text-gray-400"><X size={32} /></button>
          </div>
          <div className="space-y-6">
            <input 
              type="text" 
              value={otp} 
              onChange={e => setOtp(e.target.value)}
              placeholder="1234" 
              className="w-full bg-gray-100 border-none rounded-2xl px-4 py-4.5 text-2xl font-black outline-none focus:ring-2 focus:ring-[#a62626]/20 transition-all text-center tracking-[1em]"
              maxLength={4}
            />
            <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full bg-[#a62626] text-white py-4.5 rounded-2xl font-black text-lg shadow-xl shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : t.verify}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h2 className="text-2xl font-black text-gray-800">{t.account}</h2>
          <button onClick={onClose} className="p-2 text-gray-400"><X size={32} /></button>
        </div>

        <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[2rem] mb-8 border border-gray-100 shrink-0">
          <div className="w-14 h-14 bg-[#a62626] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <User size={32} />
          </div>
          <div>
            <h3 className="font-black text-lg text-gray-800">{lang === 'dari' ? 'کاربر خانه' : 'کور کاروونکی'}</h3>
            <span className="text-gray-400 font-bold text-xs">{phoneNumber}</span>
          </div>
        </div>

        <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
          <button onClick={() => { onShowMyAds(); onClose(); }} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-[#a62626] rounded-xl"><List size={22} /></div>
              <span className="font-black text-gray-700">{t.my_ads}</span>
            </div>
          </button>
          <button onClick={() => { onShowSaved(); onClose(); }} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-all group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Heart size={22} /></div>
              <span className="font-black text-gray-700">{t.saved}</span>
            </div>
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-100 shrink-0 flex flex-col items-center">
          <button onClick={handleLogout} className="w-full text-red-600 py-2 font-black text-sm flex items-center justify-center gap-2">
            <LogOut size={16} /> {t.logout}
          </button>
          
          {/* Subtle Admin Link */}
          <button 
            onClick={onAdminClick}
            className="mt-4 text-[9px] text-gray-300 font-bold hover:text-gray-400 transition-all flex items-center gap-1 opacity-40 hover:opacity-100"
          >
            <Shield size={10} /> {t.admin_panel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
