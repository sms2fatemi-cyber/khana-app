import React, { useState, useRef, useEffect } from 'react';
import { Service, ChatMessage } from '../types';
import { User, Sparkles, Send, ChevronRight, Bookmark, MapPinned, Phone, MessageSquare, X } from 'lucide-react';
import { consultAI } from '../services/geminiService';

interface ServiceDetailsProps {
  service: Service;
  onClose: () => void;
  onShowOnMap?: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  t: any;
}

const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service, onClose, onShowOnMap, isSaved, onToggleSave, t }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'سوالی در مورد این خدمات دارید؟' }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg = inputMessage;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInputMessage('');
    setIsThinking(true);
    const aiResponse = await consultAI(userMsg, service, 'SERVICE');
    setIsThinking(false);
    setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
  };

  const handleMapAction = () => {
    if (onShowOnMap) {
      onShowOnMap();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col md:flex-row overflow-hidden font-[Vazirmatn]" dir="rtl">
      {/* هدر موبایل */}
      <div className="md:hidden h-12 border-b flex items-center px-4 justify-between bg-white shrink-0">
        <button onClick={onClose} className="p-2 -mr-2"><ChevronRight size={24} /></button>
        <span className="font-bold text-sm truncate max-w-[200px]">{service.title}</span>
        <button onClick={onToggleSave} className="p-2">
          <Bookmark size={20} className={isSaved ? "fill-orange-600 text-orange-600" : "text-gray-400"} />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row-reverse overflow-hidden h-full">
        {/* تصویر خدمات */}
        <div className="w-full md:w-[70%] h-[40vh] md:h-full bg-orange-900 shrink-0 relative">
          <img src={service.images?.[0] || `https://picsum.photos/seed/service-${service.id}/800/600`} alt={service.title} className="w-full h-full object-contain" />
          <div className="hidden md:flex absolute top-6 left-6 gap-3 z-10">
            <button onClick={onToggleSave} className="p-2.5 bg-black/50 backdrop-blur-md text-white rounded-xl border border-white/20 hover:bg-black/70 transition-all"><Bookmark size={24} className={isSaved ? "fill-white" : ""} /></button>
            <button onClick={onClose} className="p-2.5 bg-black/50 backdrop-blur-md text-white rounded-xl border border-white/20 hover:bg-black/70 transition-all"><X size={24} /></button>
          </div>
        </div>

        {/* اطلاعات ستون کناری */}
        <div className="flex-1 md:w-[30%] overflow-y-auto no-scrollbar bg-white flex flex-col h-full border-r">
          <div className="p-5 space-y-5">
            <div className="border-b pb-5">
              <h1 className="text-xl font-black text-gray-900 mb-3 leading-relaxed">{service.title}</h1>
              <div className="flex items-center gap-2 text-orange-600 font-bold mb-3">
                <User size={20} /> <span className="text-sm">{service.providerName}</span>
              </div>
              <p className="text-gray-400 text-xs font-bold">{service.date} در {service.city}</p>
              
              <div className="flex items-center justify-between py-4 border-y mt-4">
                <span className="text-gray-600 font-bold text-sm">{t.experience}</span>
                <span className="text-lg font-black text-orange-600">{service.experience}</span>
              </div>
            </div>

            <button onClick={handleMapAction} className="w-full bg-orange-50/50 border-2 border-dashed border-orange-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:bg-orange-50 transition-all group">
              <MapPinned size={24} className="text-orange-600 group-hover:scale-110 transition-transform" />
              <span className="font-black text-xs text-orange-900">{t.select_location}</span>
            </button>

            <div>
              <h3 className="font-black text-sm text-gray-900 mb-2">{t.description}</h3>
              <p className="text-gray-600 leading-7 text-sm text-justify whitespace-pre-wrap">{service.description}</p>
            </div>

            {/* مشاور هوشمند */}
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 shadow-inner">
               <div className="flex items-center gap-2 mb-3">
                 <div className="p-1.5 bg-orange-600 rounded-lg text-white"><Sparkles size={16} /></div>
                 <h3 className="font-black text-orange-900 text-xs">{t.ai_consultant}</h3>
               </div>
               <div className="space-y-2 mb-3 max-h-[120px] overflow-y-auto no-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`p-2.5 rounded-xl text-xs font-bold leading-5 shadow-sm ${msg.role === 'user' ? 'bg-orange-600 text-white mr-8' : 'bg-white text-gray-800 ml-8 border border-orange-50'}`}>{msg.text}</div>
                  ))}
                  {isThinking && <div className="text-[10px] text-orange-400 animate-pulse px-2 font-bold">تایپ...</div>}
                  <div ref={chatEndRef} />
               </div>
               <div className="flex gap-2">
                 <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="سوالی دارید؟" className="flex-1 bg-white border border-orange-200 rounded-xl px-3 py-2 text-xs outline-none font-bold focus:ring-2 focus:ring-orange-500/20" />
                 <button onClick={handleSendMessage} className="bg-orange-600 text-white p-2 rounded-xl"><Send size={18} /></button>
               </div>
            </div>

            {/* دکمه‌های تماس دسکتاپ */}
            <div className="hidden md:flex flex-col gap-3 pt-4">
               <button onClick={() => setShowContact(!showContact)} className="w-full bg-orange-600 text-white py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-900/10 active:scale-95 transition-all">
                 <Phone size={18} /> {showContact ? service.phoneNumber : t.contact_info}
               </button>
               <button className="w-full border-2 border-gray-100 text-gray-700 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition-all">
                 <MessageSquare size={18} /> {t.chat}
               </button>
            </div>

            <div className="h-20"></div>
          </div>
        </div>
      </div>

      {/* نوار پایین موبایل */}
      <div className="md:hidden h-14 border-t bg-white px-4 flex items-center justify-between gap-3 fixed bottom-0 left-0 right-0 z-[11000] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-bottom">
        {!showContact ? (
          <>
            <button onClick={() => setShowContact(true)} className="flex-[2] bg-orange-600 text-white h-10 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-900/10">{t.contact_info}</button>
            <button className="flex-1 border-2 border-gray-100 text-gray-700 h-10 rounded-xl font-black text-xs flex items-center justify-center gap-2">{t.chat}</button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-3 duration-300">
             <div className="flex flex-col">
                <span className="text-gray-400 text-[10px] font-black uppercase">شماره تماس</span>
                <a href={`tel:${service.phoneNumber}`} className="text-base font-black text-orange-600 tracking-tighter">{service.phoneNumber}</a>
             </div>
             <div className="flex gap-2">
                <a href={`tel:${service.phoneNumber}`} className="bg-orange-600 text-white p-2.5 rounded-xl shadow-lg shadow-orange-900/20"><Phone size={20} /></a>
                <button onClick={() => setShowContact(false)} className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl font-black text-xs">بستن</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetails;