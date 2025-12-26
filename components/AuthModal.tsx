
import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, List, Heart, Settings, LogOut, ChevronLeft, User, Smartphone, ArrowRight, Loader2, Bell, Moon } from 'lucide-react';
import { translations } from '../services/translations';

interface AuthModalProps {
  onClose: () => void;
  onShowMyAds: () => void;
  onShowSaved: () => void;
  lang: 'dari' | 'pashto';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onShowMyAds, onShowSaved, lang }) => {
  const t = translations[lang];
  const [view, setView] = useState<'login' | 'otp' | 'profile' | 'settings'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({ darkMode: false, notifications: true });

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
      alert(lang === 'dari' ? 'کد اشتباه است (۱۲۳۴ را امتحان کنید)' : 'کوډ ناسم دی (۱۲۳۴ هڅه وکړئ)');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_phone');
    setView('login');
  };

  const handleAdminLogin = () => {
    onClose();
    setTimeout(() => {
      window.location.hash = 'admin';
    }, 100);
  };

  if (view === 'login') {
    return (
      <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-gray-800">{t.login_title}</h2>
            <button onClick={onClose} className="p-2"><X size={28} className="text-gray-400" /></button>
          </div>
          <div className="space-y-6">
            <div className="text-center p-6 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
               <div className="w-16 h-16 bg-[#a62626]/10 text-[#a62626] rounded-full flex items-center justify-center mx-auto mb-4">
                 <Smartphone size={32} />
               </div>
               <p className="text-sm font-bold text-gray-500">{t.enter_phone}</p>
            </div>
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
          <div className="h-8 md:hidden"></div>
        </div>
      </div>
    );
  }

  if (view === 'otp') {
    return (
      <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
          <button onClick={() => setView('login')} className="absolute top-8 left-8 p-2 bg-gray-100 rounded-xl text-gray-500"><ArrowRight size={20} /></button>
          <h2 className="text-2xl font-black text-gray-800 mb-2">{t.enter_otp}</h2>
          <p className="text-xs font-bold text-gray-400 mb-8">{lang === 'dari' ? `کد به شماره ${phoneNumber} ارسال شد` : `کوډ ${phoneNumber} شمیرې ته واستول شو`}</p>
          <div className="space-y-6">
            <input 
              type="text" 
              value={otp} 
              onChange={e => setOtp(e.target.value)}
              placeholder="----" 
              maxLength={4}
              className="w-full bg-gray-100 border-none rounded-2xl px-4 py-5 text-3xl font-black outline-none tracking-[1rem] text-center focus:ring-2 focus:ring-[#a62626]/20 transition-all"
            />
            <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full bg-[#a62626] text-white py-4.5 rounded-2xl font-black text-lg shadow-xl shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="animate-spin" /> : t.verify}
            </button>
          </div>
          <div className="h-8 md:hidden"></div>
        </div>
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setView('profile')} className="p-2 bg-gray-100 rounded-xl text-gray-500"><ChevronLeft size={24} /></button>
            <h2 className="text-xl font-black text-gray-800">{t.app_settings}</h2>
          </div>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
               <div className="flex items-center gap-3">
                 <Moon size={20} className="text-gray-400" />
                 <span className="font-bold text-gray-700">{t.dark_mode}</span>
               </div>
               <button onClick={() => setSettings(s => ({...s, darkMode: !s.darkMode}))} className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-red-600' : 'bg-gray-300'}`}>
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.darkMode ? 'right-7' : 'right-1'}`}></div>
               </button>
             </div>
             <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl">
               <div className="flex items-center gap-3">
                 <Bell size={20} className="text-gray-400" />
                 <span className="font-bold text-gray-700">{t.notifications}</span>
               </div>
               <button onClick={() => setSettings(s => ({...s, notifications: !s.notifications}))} className={`w-12 h-6 rounded-full transition-colors relative ${settings.notifications ? 'bg-green-600' : 'bg-gray-300'}`}>
                 <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notifications ? 'right-7' : 'right-1'}`}></div>
               </button>
             </div>
          </div>
          <div className="h-8 md:hidden"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-gray-800">{t.account}</h2>
          <button onClick={onClose} className="p-2"><X size={28} className="text-gray-400" /></button>
        </div>

        <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-[2rem] mb-8 border border-gray-100">
          <div className="w-14 h-14 bg-[#a62626] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/20">
            <User size={32} />
          </div>
          <div>
            <h3 className="font-black text-lg text-gray-800">{t.guest_user}</h3>
            <div className="flex items-center gap-1 text-gray-400 font-bold text-xs mt-1">
               <Smartphone size={12} />
               <span className="dir-ltr">{phoneNumber || '۰۷XXXXXXXX'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => { onShowMyAds(); onClose(); }} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-[#a62626] rounded-xl group-hover:bg-[#a62626] group-hover:text-white transition-colors"><List size={22} /></div>
              <span className="font-black text-gray-700">{t.my_ads}</span>
            </div>
            <ChevronLeft size={20} className="text-gray-300" />
          </button>

          <button onClick={() => { onShowSaved(); onClose(); }} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors"><Heart size={22} /></div>
              <span className="font-black text-gray-700">{t.saved}</span>
            </div>
            <ChevronLeft size={20} className="text-gray-300" />
          </button>

          <button onClick={() => setView('settings')} className="w-full flex items-center justify-between p-5 hover:bg-gray-50 rounded-2xl transition-all group border border-transparent hover:border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 text-gray-500 rounded-xl group-hover:bg-gray-800 group-hover:text-white transition-colors"><Settings size={22} /></div>
              <span className="font-black text-gray-700">{t.settings}</span>
            </div>
            <ChevronLeft size={20} className="text-gray-300" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
          <button onClick={handleAdminLogin} className="w-full bg-gray-900 text-white py-4.5 rounded-2xl font-black text-base flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            <ShieldCheck size={22} className="text-red-500" />
            {t.admin_panel}
          </button>
          
          <button onClick={handleLogout} className="w-full text-gray-400 py-2 font-bold text-sm flex items-center justify-center gap-2 hover:text-red-600 transition-colors">
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
        <div className="h-8 md:hidden"></div>
      </div>
    </div>
  );
};

export default AuthModal;
