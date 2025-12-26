
import React, { useState, useRef, useEffect } from 'react';
import { Job, ChatMessage } from '../types';
import { X, Building2, Sparkles, Send, ChevronRight, Bookmark, MapPinned, Phone, MessageSquare } from 'lucide-react';
import { consultAI } from '../services/geminiService';

interface JobDetailsProps {
  job: Job;
  onClose: () => void;
  onShowOnMap?: () => void;
  isSaved: boolean;
  onToggleSave: () => void;
  t: any;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job, onClose, onShowOnMap, isSaved, onToggleSave, t }) => {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{ role: 'model', text: 'سلام! سوال شما در مورد این شغل چیست؟' }]);
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
    const aiResponse = await consultAI(userMsg, job, 'JOB');
    setIsThinking(false);
    setChatMessages(prev => [...prev, { role: 'model', text: aiResponse }]);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-white flex flex-col md:flex-row overflow-hidden font-[Vazirmatn]" dir="rtl">
      {/* هدر موبایل */}
      <div className="md:hidden h-16 border-b flex items-center px-5 justify-between bg-white shrink-0">
        <button onClick={onClose} className="p-2 -mr-2"><ChevronRight size={32} /></button>
        <span className="font-bold text-lg truncate max-w-[200px]">{job.title}</span>
        <button onClick={onToggleSave} className="p-2">
          <Bookmark size={28} className={isSaved ? "fill-blue-600 text-blue-600" : "text-gray-400"} />
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row-reverse overflow-hidden h-full">
        {/* تصویر شغل */}
        <div className="w-full md:w-[70%] h-[40vh] md:h-full bg-blue-900 shrink-0 relative shadow-2xl">
          <img src={job.images?.[0] || `https://picsum.photos/seed/job-${job.id}/800/600`} alt={job.title} className="w-full h-full object-contain" />
          <div className="hidden md:flex absolute top-10 left-10 gap-4 z-10">
            <button onClick={onToggleSave} className="p-4 bg-black/50 backdrop-blur-md text-white rounded-2xl border border-white/20 hover:bg-black/70 transition-all shadow-xl"><Bookmark size={32} className={isSaved ? "fill-white" : ""} /></button>
            <button onClick={onClose} className="p-4 bg-black/50 backdrop-blur-md text-white rounded-2xl border border-white/20 hover:bg-black/70 transition-all shadow-xl"><X size={32} /></button>
          </div>
        </div>

        {/* اطلاعات شغل */}
        <div className="flex-1 md:w-[30%] overflow-y-auto no-scrollbar bg-white flex flex-col h-full border-r shadow-2xl">
          <div className="p-8 space-y-8">
            <div className="border-b pb-8">
              <h1 className="text-3xl font-black text-gray-900 mb-5 leading-relaxed">{job.title}</h1>
              <div className="flex items-center gap-3 text-blue-700 font-bold mb-5 bg-blue-50 p-3 rounded-2xl inline-flex">
                <Building2 size={28} /> <span className="text-lg">{job.company}</span>
              </div>
              <p className="text-gray-400 text-sm font-bold">{job.date} در {job.city}</p>
              
              <div className="flex items-center justify-between py-6 border-y mt-8">
                <span className="text-gray-600 font-bold text-lg">معاش پیشنهادی</span>
                <span className="text-2xl font-black text-blue-700">{job.salary?.toLocaleString()} {job.currency}</span>
              </div>
            </div>

            <button onClick={onShowOnMap} className="w-full bg-blue-50/50 border-2 border-dashed border-blue-200 rounded-[2rem] p-6 flex flex-col items-center gap-3 hover:bg-blue-50 transition-all group shadow-sm">
              <MapPinned size={40} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-black text-base text-blue-900">مشاهده آدرس روی نقشه</span>
            </button>

            <div>
              <h3 className="font-black text-xl text-gray-900 mb-4 underline decoration-blue-200 decoration-8 underline-offset-[-2px]">شرح وظایف</h3>
              <p className="text-gray-600 leading-9 text-lg text-justify whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* بخش AI */}
            <div className="bg-blue-50/70 rounded-[2.5rem] p-6 border border-blue-100 shadow-inner">
               <div className="flex items-center gap-3 mb-5">
                 <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg"><Sparkles size={24} /></div>
                 <h3 className="font-black text-blue-900 text-base">{t.ai_consultant}</h3>
               </div>
               <div className="space-y-4 mb-5 max-h-[220px] overflow-y-auto no-scrollbar">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`p-4.5 rounded-2xl text-sm font-bold leading-7 shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white mr-10 shadow-blue-200' : 'bg-white text-gray-800 ml-10 border border-blue-50'}`}>{msg.text}</div>
                  ))}
                  {isThinking && <div className="text-xs text-blue-400 animate-pulse px-4 font-black">در حال پاسخگویی...</div>}
                  <div ref={chatEndRef} />
               </div>
               <div className="flex gap-3">
                 <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="سوالی دارید؟" className="flex-1 bg-white border border-blue-200 rounded-2xl px-5 py-4 text-base outline-none font-bold focus:ring-4 focus:ring-blue-500/10 transition-all" />
                 <button onClick={handleSendMessage} className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200 hover:scale-105 active:scale-95 transition-all"><Send size={24} /></button>
               </div>
            </div>

            {/* دکمه‌های تماس دسکتاپ */}
            <div className="hidden md:flex flex-col gap-4 pt-4">
               <button onClick={() => setShowContact(!showContact)} className="w-full bg-blue-700 text-white py-5.5 rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-900/20 active:scale-95 transition-all">
                 <Phone size={32} /> {showContact ? (job.phoneNumber || "۰۷۰۰۰۰۰۰۰۰") : "ارسال رزومه / تماس"}
               </button>
               <button className="w-full border-2 border-gray-100 text-gray-700 py-5.5 rounded-[1.8rem] font-black text-xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">
                 <MessageSquare size={32} /> چت با مسئول استخدام
               </button>
            </div>

            <div className="h-28"></div>
          </div>
        </div>
      </div>

      {/* نوار پایین موبایل */}
      <div className="md:hidden h-20 border-t bg-white px-6 flex items-center justify-between gap-5 fixed bottom-0 left-0 right-0 z-[11000] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] safe-area-bottom">
        {!showContact ? (
          <>
            <button onClick={() => setShowContact(true)} className="flex-[2] bg-blue-700 text-white h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-900/20">درخواست همکاری / تماس</button>
            <button className="flex-1 border-2 border-gray-100 text-gray-700 h-14 rounded-2xl font-black text-base flex items-center justify-center gap-2">چت</button>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-between gap-5 animate-in slide-in-from-bottom-5 duration-300">
             <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-black uppercase">شماره تماس</span>
                <a href={`tel:${job.phoneNumber || '0700000000'}`} className="text-2xl font-black text-blue-700 tracking-tighter">{job.phoneNumber || '۰۷۰۰۰۰۰۰۰۰'}</a>
             </div>
             <div className="flex gap-4">
                <a href={`tel:${job.phoneNumber || '0700000000'}`} className="bg-blue-700 text-white p-4 rounded-2xl shadow-xl shadow-blue-900/20"><Phone size={32} /></a>
                <button onClick={() => setShowContact(false)} className="bg-gray-100 text-gray-500 px-6 py-4 rounded-2xl font-black text-sm">بستن</button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
