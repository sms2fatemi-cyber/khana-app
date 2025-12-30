
import React, { useState, useEffect } from 'react';
import { X, List, Heart, LogOut, User, Smartphone, Loader2, Shield, Bell, ChevronRight } from 'lucide-react';
import { translations } from '../services/translations';
import { AdminMessage } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onShowMyAds: () => void;
  onShowSaved: () => void;
  onAdminClick: () => void;
  lang: 'dari' | 'pashto';
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onShowMyAds, onShowSaved, onAdminClick, lang }) => {
  const t = translations[lang];
  const [view, setView] = useState<'login' | 'otp' | 'profile' | 'messages'>('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userMessages, setUserMessages] = useState<AdminMessage[]>([]);

  useEffect(() => {
    const savedPhone = localStorage.getItem('user_phone');
    if (savedPhone) {
      setView('profile');
      setPhoneNumber(savedPhone);
      const allMsgs = JSON.parse(localStorage.getItem('admin_messages') || '[]');
      setUserMessages(allMsgs.filter((m: any) => m.targetPhone === savedPhone));
    }
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleSendOtp = () => {
    if (phoneNumber.length < 9) {
      alert(lang === 'dari' ? 'شماره نامعتبر است' : 'شماره سمه نه ده');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setView('otp');
      setTimer(60);
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp.length === 4) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        localStorage.setItem('user_phone', phoneNumber);
        setView('profile');
      }, 1000);
    } else {
      alert(lang === 'dari' ? 'کد ۴ رقمی را وارد کنید' : '۴ رقمه کوډ ولیکئ');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_phone');
    setView('login');
  };

  const unreadCount = userMessages.filter(m => !m.isRead).length;

  if (view === 'login') {
    return (
      <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[3rem] p-10 shadow-2xl relative animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black text-gray-800">{t.login_title}</h2>
            <button onClick={onClose} className="p-3 text-gray-400 bg-gray-50 rounded-full hover:bg-red-50 transition-colors"><X size={28} /></button>
          </div>
          <div className="space-y-8">
            <div className="relative">
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
              <input 
                type="tel" 
                value={phoneNumber} 
                onChange={e => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX" 
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pr-14 pl-4 py-5 text-2xl font-black outline-none focus:border-[#a62626] transition-all text-left dir-ltr shadow-inner"
              />
            </div>
            <button onClick={handleSendOtp} disabled={isLoading} className="w-full bg-[#a62626] text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-red-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
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
        <div className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[3rem] p-10 shadow-2xl relative animate-in slide-in-from-bottom duration-300" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black text-gray-800">{t.enter_otp}</h2>
            <button onClick={() => setView('login')} className="p-3 text-gray-400 bg-gray-50 rounded-full transition-colors"><X size={28} /></button>
          </div>
          <div className="space-y-8">
            <input 
              type="text" 
              value={otp} 
              onChange={e => setOtp(e.target.value)}
              placeholder="----" 
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-6 text-4xl font-black outline-none focus:border-[#a62626] transition-all text-center tracking-[0.5em] shadow-inner"
              maxLength={4}
            />
            <div className="text-center text-gray-400 font-bold">
              {timer > 0 ? `ارسال مجدد تا ${timer} ثانیه دیگر` : <button onClick={handleSendOtp} className="text-[#a62626] font-black">ارسال مجدد کد</button>}
            </div>
            <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full bg-[#a62626] text-white py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
              {isLoading ? <Loader2 className="animate-spin" /> : t.verify}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'messages') {
    return (
      <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white w-full max-w-md h-[80vh] md:h-[70vh] rounded-t-[2.5rem] md:rounded-[3rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom duration-300 flex flex-col" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6 shrink-0">
             <h2 className="text-2xl font-black text-gray-800">{t.notifications}</h2>
             <button onClick={() => setView('profile')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"><ChevronRight className="rotate-180" /></button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
            {userMessages.length === 0 ? (
              <div className="text-center py-24 text-gray-300 font-bold flex flex-col items-center gap-3"><Bell size={48} className="opacity-20" />پیامی ندارید</div>
            ) : (
              userMessages.map(msg => (
                <div key={msg.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 relative shadow-sm">
                   {!msg.isRead && <div className="absolute top-3 left-3 w-2.5 h-2.5 bg-red-500 rounded-full shadow-lg"></div>}
                   <p className="text-gray-700 font-bold leading-7 text-sm">{msg.text}</p>
                   <span className="block text-[10px] text-gray-400 mt-3 text-left font-black">{msg.date}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[11000] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white w-full max-w-md max-h-[85vh] rounded-t-[3rem] md:rounded-[3rem] p-8 shadow-2xl relative flex flex-col overflow-hidden animate-in slide-in-from-bottom" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8 shrink-0">
          <h2 className="text-3xl font-black text-gray-800">{t.account}</h2>
          <button onClick={onClose} className="p-3 text-gray-400 bg-gray-50 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-6 pr-1">
          <div className="flex items-center gap-5 p-6 bg-gray-50 rounded-[2.5rem] mb-8 border border-gray-100 shadow-inner">
            <div className="w-16 h-16 bg-[#a62626] text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-900/20"><User size={36} /></div>
            <div className="flex-1">
              <h3 className="font-black text-xl text-gray-800 tracking-tighter">{phoneNumber}</h3>
              <span className="text-gray-400 font-bold text-xs">پروفایل کاربری</span>
            </div>
          </div>

          <div className="space-y-3">
            <button onClick={() => setView('messages')} className="w-full flex items-center justify-between p-6 bg-red-50/50 rounded-2xl transition-all border border-red-100 hover:bg-red-50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 text-[#a62626] rounded-xl relative">
                  <Bell size={24} />
                  {unreadCount > 0 && <span className="absolute -top-1 -left-1 w-6 h-6 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">{unreadCount}</span>}
                </div>
                <div className="text-right">
                   <span className="font-black text-gray-800 text-lg block leading-none">{t.notifications}</span>
                   <span className="text-[10px] text-red-600 font-black mt-1 block">اعلان‌های سیستم</span>
                </div>
              </div>
              <ChevronRight className="rotate-180 text-[#a62626]" />
            </button>

            <button onClick={() => { onShowMyAds(); onClose(); }} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 text-gray-600 rounded-xl"><List size={24} /></div>
                <span className="font-black text-gray-700 text-lg">{t.my_ads}</span>
              </div>
              <ChevronRight className="rotate-180 text-gray-300" />
            </button>

            <button onClick={() => { onShowSaved(); onClose(); }} className="w-full flex items-center justify-between p-6 hover:bg-gray-50 rounded-2xl transition-all border border-transparent hover:border-gray-100">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 text-gray-600 rounded-xl"><Heart size={24} /></div>
                <span className="font-black text-gray-700 text-lg">{t.saved}</span>
              </div>
              <ChevronRight className="rotate-180 text-gray-300" />
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
            <button onClick={handleLogout} className="w-full bg-gray-50 text-red-600 py-4.5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all hover:bg-red-50 active:scale-95"><LogOut size={20} /> {t.logout}</button>
            <button 
               onClick={onAdminClick} 
               className="mt-2 text-[12px] text-gray-300 font-black hover:text-[#a62626] transition-all flex items-center gap-2 border-b border-gray-100 pb-1"
            >
              <Shield size={16} /> {t.admin_panel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
