
import React, { useState, useRef, useEffect } from 'react';
import { Property, ChatMessage } from '../types';
import { X, MessageSquare, Sparkles, Send, Bookmark, ChevronRight, Phone, ChevronLeft, MapPinned, Share2, Copy, Check } from 'lucide-react';
import { consultAI } from '../services/geminiService';

interface PropertyDetailsProps {
  property: Property;
  onClose: () => void;
  onShowOnMap?: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  t: any;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose, onShowOnMap, isSaved, onToggleSave, t }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'سلام! هر سوالی درباره این ملک داری از من بپرس.' }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const allImages = property.images?.length ? property.images : [`https://picsum.photos/seed/${property.id}/800/600`];

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage('');
    setIsThinking(true);
    const aiResponse = await consultAI(userMsg, property);
    setIsThinking(false);
    setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col md:flex-row overflow-hidden font-[Vazirmatn]" dir="rtl">
      
      {/* هدر موبایل */}
      <div className="md:hidden h-16 border-b flex items-center px-5 justify-between bg-white shrink-0">
        <button onClick={onClose} className="p-2 -mr-2"><ChevronRight size={32} /></button>
        <span className="font-bold text-lg truncate max-w-[150px]">{property.title}</span>
        <div className="flex gap-1">
          <button onClick={handleShare} className="p-2 text-gray-400">
            {isCopied ? <Check size={24} className="text-green-500" /> : <Share2 size={24} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onToggleSave(); }} className="p-2">
             <Bookmark size={28} className={isSaved ? "fill-[#a62626] text-[#a62626]" : "text-gray-400"} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row-reverse overflow-hidden h-full">
        {/* تصویر ملک */}
        <div className="w-full md:w-[70%] h-[45vh] md:h-full bg-black shrink-0 relative shadow-2xl">
          <img src={allImages[activeImageIndex]} alt={property.title} className="w-full h-full object-contain" key={activeImageIndex} />
          {allImages.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 pointer-events-none">
              <button onClick={() => setActiveImageIndex(p => (p > 0 ? p - 1 : allImages.length - 1))} className="p-3 bg-black/50 rounded-full text-white pointer-events-auto backdrop-blur-md shadow-2xl hover:bg-black/80 transition-all"><ChevronLeft size={32} /></button>
              <button onClick={() => setActiveImageIndex(p => (p < allImages.length - 1 ? p + 1 : 0))} className="p-3 bg-black/50 rounded-full text-white pointer-events-auto backdrop-blur-md shadow-2xl hover:bg-black/80 transition-all"><ChevronRight size={32} /></button>
            </div>
          )}
          <div className="hidden md:flex absolute top-10 left-10 gap-4 z-10">
            <button onClick={handleShare} className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl border border-white/20 hover:bg-white/30 transition-all shadow-2xl">
              {isCopied ? <Check size={32} className="text-green-400" /> : <Copy size={32} />}
            </button>
            <button onClick={onToggleSave} className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl border border-white/20 hover:bg-white/30 transition-all shadow-2xl"><Bookmark size={32} className={isSaved ? "fill-white" : ""} /></button>
            <button onClick={onClose} className="p-4 bg-white/10 backdrop-blur-xl text-white rounded-2xl border border-white/20 hover:bg-white/30 transition-all shadow-2xl"><X size={32} /></button>
          </div>
        </div>

        {/* ستون اطلاعات */}
        <div className="flex-1 md:w-[30%] overflow-y-auto no-scrollbar bg-white flex flex-col h-full border-r shadow-2xl">
          <div className="p-8 space-y-8">
            <div>
              <div className="flex justify-between items-start mb-2">
                 <h1 className="text-3xl font-black text-gray-900 leading-snug">{property.title}</h1>
              </div>
              <p className="text-gray-400 text-sm font-bold">{property.date} در {property.city}</p>
              
              <div className="mt-6 grid grid-cols-2 gap-6 border-y py-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-400 font-bold mb-2">قیمت کل</span>
                  <span className="text-2xl font-black text-[#a62626]">{property.price.toLocaleString()} <small className="text-sm">افغانی</small></span>
                  <span className="text-[10px] text-gray-400 font-bold mt-1">مطابق نرخ روز</span>
                </div>
                <div className="flex flex-col border-r pr-6">
                  <span className="text-sm text-gray-400 font-bold mb-2">نوع معامله</span>
                  <span className="text-lg font-black">{property.dealType}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                <span className="text-sm text-gray-500 font-bold">مساحت</span>
                <span className="font-black text-lg">{property.area} متر</span>
              </div>
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm">
                <span className="text-sm text-gray-500 font-bold">اتاق</span>
                <span className="font-black text-lg">{property.bedrooms}</span>
              </div>
            </div>

            <button onClick={onShowOnMap} className="w-full bg-gray-50 border-2 border-gray-200 rounded-[1.5rem] p-5 flex items-center justify-center gap-3 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm group">
              <MapPinned size={32} className="text-[#a62626] group-hover:scale-110 transition-transform" />
              <span className="font-black text-base text-gray-700">مشاهده دقیق روی نقشه</span>
            </button>

            <div>
              <h3 className="font-black text-xl text-gray-900 mb-4 underline decoration-[#a62626]/20 decoration-8 underline-offset-[-2px]">توضیحات تکمیلی</h3>
              <p className="text-gray-600 leading-9 text-lg text-justify whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* بخش مشاور هوشمند (AI) */}
            <div className="bg-indigo-50/70 rounded-[2.5rem] p-6 border border-indigo-100 shadow-inner">
               <div className="flex items-center gap-3 mb-5">
                 <div className="p-2.5 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200"><Sparkles size={24} /></div>
                 <h3 className="font-black text-indigo-900 text-base">{t.ai_consultant}</h3>
               </div>
               <div className="space-y-4 mb-5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`p-4.5 rounded-2xl text-sm font-bold leading-7 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white mr-10 shadow-indigo-200' : 'bg-white text-gray-800 ml-10 border border-indigo-50'}`}>{msg.text}</div>
                  ))}
                  {isThinking && <div className="text-xs text-indigo-400 animate-pulse px-4 font-black">در حال تحلیل داده‌ها...</div>}
                  <div ref={chatEndRef} />
               </div>
               <div className="flex gap-3">
                 <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="سوالی داری؟ بپرس..." className="flex-1 bg-white border border-indigo-200 rounded-2xl px-5 py-4 text-base outline-none font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                 <button onClick={handleSendMessage} className="bg-indigo-600 text-white p-4 rounded-2xl hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-200"><Send size={24} /></button>
               </div>
            </div>

            {/* دکمه‌های تماس فقط در حالت دسکتاپ */}
            <div className="hidden md:flex flex-col gap-4 pt-4">
               <button onClick={() => setShowContact(!showContact)} className="w-full bg-[#a62626] text-white py-5.5 rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-red-900/20 active:scale-95 transition-all">
                 <Phone size={32} /> {showContact ? (property.phoneNumber || "۰۷۰۰۱۱۲۲۳۳") : "تماس مستقیم با مالک"}
               </button>
               <button className="w-full border-2 border-gray-100 text-gray-700 py-5.5 rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
                 <MessageSquare size={32} /> شروع گفتگو در چت
               </button>
            </div>

            <div className="h-28"></div> 
          </div>
        </div>
      </div>

      {/* نوار پایین تماس فقط در موبایل */}
      <div className="md:hidden h-20 border-t bg-white px-6 flex items-center justify-between gap-5 fixed bottom-0 left-0 right-0 z-[11000] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] safe-area-bottom">
        {!showContact ? (
          <>
            <button onClick={() => setShowContact(true)} className="flex-[2] bg-[#a62626] text-white h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-red-900/20"><Phone size={28} /> تماس مستقیم</button>
            <button className="flex-1 border-2 border-gray-100 text-gray-700 h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2">چت</button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-between gap-5 animate-in slide-in-from-bottom-10 duration-400">
             <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-black uppercase tracking-wider">شماره مالک</span>
                <a href={`tel:${property.phoneNumber || '0700112233'}`} className="text-2xl font-black text-[#a62626] tracking-tight">{property.phoneNumber || '۰۷۰۰۱۱۲۲۳۳'}</a>
             </div>
             <div className="flex gap-4">
                <a href={`tel:${property.phoneNumber || '0700112233'}`} className="bg-[#a62626] text-white p-4 rounded-2xl shadow-2xl shadow-red-900/30"><Phone size={32} /></a>
                <button onClick={() => setShowContact(false)} className="bg-gray-100 text-gray-500 px-6 py-4 rounded-2xl font-black text-sm transition-colors">بستن</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default PropertyDetails;
