import React, { useState, useRef, useEffect } from 'react';
import { Property, ChatMessage } from '../types';
import { Sparkles, Send, Bookmark, ChevronRight, Phone, ChevronLeft, MapPinned, Share2 } from 'lucide-react';
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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'سلام! من مشاور هوشمند دیوار هستم. چه سوالی درباره این ملک دارید؟' }]);
  const [inputMessage, setInputMessage] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
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

  const handleMapAction = () => {
    if (onShowOnMap) {
      onShowOnMap();
      onClose();
    }
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col overflow-hidden font-[Vazirmatn]" dir="rtl">
      {/* هدر */}
      <div className="h-14 border-b flex items-center px-4 justify-between bg-white shrink-0 z-10">
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><ChevronRight size={28} className="text-gray-700" /></button>
        </div>
        <div className="flex gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"><Share2 size={22} /></button>
          <button onClick={onToggleSave} className="p-2 hover:bg-gray-100 rounded-full">
             <Bookmark size={22} className={isSaved ? "fill-[#a62626] text-[#a62626]" : "text-gray-600"} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="w-full aspect-[16/9] md:aspect-[2/1] bg-gray-100 relative group">
          <img src={allImages[activeImageIndex]} alt={property.title} className="w-full h-full object-cover transition-opacity duration-500" />
          
          {allImages.length > 1 && (
            <>
              <button 
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all"
              >
                <ChevronRight size={24} className="rotate-180" />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-4 py-1.5 rounded-full text-xs font-black backdrop-blur-md">
            {activeImageIndex + 1} از {allImages.length}
          </div>
        </div>

        <div className="p-5 md:p-8 space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-3">{property.title}</h1>
            <p className="text-gray-400 text-sm font-bold flex items-center gap-2">
              <span>{property.date} در {property.city}</span>
            </p>
          </div>

          <hr className="border-gray-100" />

          <div className="grid grid-cols-3 gap-4 py-4 text-center">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-bold">{t.area}</span>
              <span className="font-black text-base">{property.area} متر</span>
            </div>
            <div className="flex flex-col gap-1 border-x border-gray-100">
              <span className="text-gray-400 text-xs font-bold">{t.bedrooms}</span>
              <span className="font-black text-base">{property.bedrooms} اتاق</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 text-xs font-bold">{t.type}</span>
              <span className="font-black text-base">{property.type}</span>
            </div>
          </div>

          <hr className="border-gray-100" />

          <div>
            <button 
              onClick={handleMapAction} 
              className="w-full flex items-center justify-between py-4 px-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm text-[#a62626] group-hover:scale-110 transition-transform">
                  <MapPinned size={24} />
                </div>
                <div className="text-right">
                  <span className="block text-sm font-black text-gray-800">{t.select_location}</span>
                  <span className="text-[11px] text-gray-400 font-bold">{property.address || property.city}</span>
                </div>
              </div>
              <ChevronLeft size={20} className="text-gray-300" />
            </button>
          </div>

          <hr className="border-gray-100" />

          <div>
            <h3 className="font-black text-lg text-gray-900 mb-4">{t.description}</h3>
            <p className="text-gray-600 leading-8 text-[15px] text-justify whitespace-pre-wrap font-medium">{property.description}</p>
          </div>

          <div className="bg-[#a62626]/5 rounded-3xl p-6 border border-[#a62626]/10 shadow-sm">
             <div className="flex items-center gap-3 mb-5">
               <div className="p-2 bg-[#a62626] text-white rounded-xl shadow-lg">
                 <Sparkles size={20} />
               </div>
               <h3 className="font-black text-[#a62626] text-[16px]">{t.ai_consultant}</h3>
             </div>
             <div className="max-h-[200px] overflow-y-auto no-scrollbar mb-4 space-y-3">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`p-4 rounded-2xl text-[13px] font-bold leading-6 shadow-sm ${msg.role === 'user' ? 'bg-[#a62626] text-white mr-8 ml-2' : 'bg-white text-gray-800 ml-8 mr-2 border border-gray-100'}`}>{msg.text}</div>
                ))}
                {isThinking && <div className="text-[11px] text-[#a62626] animate-pulse px-4 font-black italic">در حال تحلیل...</div>}
                <div ref={chatEndRef} />
             </div>
             <div className="flex gap-3">
               <input 
                  type="text" 
                  value={inputMessage} 
                  onChange={(e) => setInputMessage(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="سوالی دارید؟" 
                  className="flex-1 bg-white border border-gray-200 rounded-2xl px-5 py-3.5 text-sm outline-none font-bold focus:ring-2 focus:ring-[#a62626]/20 transition-all"
               />
               <button onClick={handleSendMessage} className="bg-[#a62626] text-white p-3.5 rounded-2xl shadow-lg active:scale-95 transition-all"><Send size={22} /></button>
             </div>
          </div>
        </div>
      </div>

      <div className="h-20 border-t bg-white px-4 md:px-10 flex items-center gap-4 fixed bottom-0 left-0 right-0 z-[11000] safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <button className="flex-1 border-2 border-gray-200 text-gray-700 h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2 active:bg-gray-50 transition-all">{t.chat}</button>
        {!showContact ? (
          <button onClick={() => setShowContact(true)} className="flex-[2] bg-[#a62626] text-white h-12 rounded-xl font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-red-900/10">{t.contact_info}</button>
        ) : (
          <a href={`tel:${property.phoneNumber || '0700112233'}`} className="flex-[2] bg-green-600 text-white h-12 rounded-xl font-black text-lg flex items-center justify-center gap-3 animate-in zoom-in duration-300 shadow-xl shadow-green-900/10">
            <Phone size={24} /> {property.phoneNumber || '۰۷۰۰۱۱۲۲۳۳'}
          </a>
        )}
      </div>
    </div>
  );
};
export default PropertyDetails;