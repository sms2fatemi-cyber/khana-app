
import React, { useState, useEffect } from 'react';
import { Property, Job, Service } from '../types';
import { Check, Trash2, Home, Briefcase, Wrench, Shield, LogOut, Loader2, X, Phone, MapPin, Eye } from 'lucide-react';
import { supabase, TABLES, isSupabaseReady } from '../services/supabaseClient';

interface AdminPanelProps {
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  onExit: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  properties, setProperties, 
  jobs, setJobs, 
  services, setServices,
  onExit 
}) => {
  const [activeTab, setActiveTab] = useState<'ESTATE' | 'JOBS' | 'SERVICES'>('ESTATE');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Property | Job | Service | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isSupabaseReady()) return;
      
      const { data: p } = await supabase.from(TABLES.PROPERTIES).select('*').order('created_at', { ascending: false });
      if (p) setProperties(p.map((it: any) => ({ ...it, dealType: it.deal_type, type: it.property_type, phoneNumber: it.phone_number, images: it.images || [it.image] })));

      const { data: j } = await supabase.from(TABLES.JOBS).select('*').order('created_at', { ascending: false });
      if (j) setJobs(j.map((it: any) => ({ ...it, jobType: it.job_type, phoneNumber: it.phone_number, images: it.images || [it.image] })));

      const { data: s } = await supabase.from(TABLES.SERVICES).select('*').order('created_at', { ascending: false });
      if (s) setServices(s.map((it: any) => ({ ...it, providerName: it.provider_name, phoneNumber: it.phone_number, images: it.images || [it.image] })));
    };
    fetchAdminData();
  }, [setProperties, setJobs, setServices]);

  const handleAction = async (id: string, type: string, action: 'APPROVE' | 'DELETE') => {
    if (action === 'DELETE' && !window.confirm('آیا از حذف این آگهی مطمئن هستید؟')) return;
    
    setIsActionLoading(id);
    const table = type === 'ESTATE' ? TABLES.PROPERTIES : type === 'JOBS' ? TABLES.JOBS : TABLES.SERVICES;
    
    try {
      if (action === 'APPROVE') {
        const { error } = await supabase.from(table).update({ status: 'APPROVED' }).eq('id', id);
        if (error) throw error;
        if (type === 'ESTATE') setProperties(prev => prev.map(p => p.id === id ? { ...p, status: 'APPROVED' } : p));
        if (type === 'JOBS') setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'APPROVED' } : j));
        if (type === 'SERVICES') setServices(prev => prev.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s));
      } else {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        if (type === 'ESTATE') setProperties(prev => prev.filter(p => p.id !== id));
        if (type === 'JOBS') setJobs(prev => prev.filter(j => j.id !== id));
        if (type === 'SERVICES') setServices(prev => prev.filter(s => s.id !== id));
      }
      setSelectedItem(null);
    } catch (err) {
      alert("خطا در انجام عملیات");
    } finally {
      setIsActionLoading(null);
    }
  };

  const renderPreviewModal = () => {
    if (!selectedItem) return null;
    const item = selectedItem as any;
    const isEstate = 'bedrooms' in item;
    const isJob = 'company' in item;
    const typeLabel = isEstate ? 'ESTATE' : isJob ? 'JOBS' : 'SERVICES';

    return (
      <div className="fixed inset-0 z-[12000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-10" onClick={() => setSelectedItem(null)}>
        <div className="bg-white w-full max-w-5xl max-h-full rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 relative" onClick={e => e.stopPropagation()}>
          
          <div className="p-8 border-b flex justify-between items-center bg-gray-50 shrink-0">
            <div className="flex items-center gap-4">
               <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${item.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                 {item.status === 'APPROVED' ? 'تایید شده' : 'در انتظار تایید'}
               </div>
               <h2 className="text-2xl font-black text-gray-800 line-clamp-1">{item.title}</h2>
            </div>
            <button onClick={() => setSelectedItem(null)} className="p-3 bg-gray-200 hover:bg-gray-300 rounded-full transition-all active:scale-90"><X size={32} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 md:p-14 no-scrollbar">
            <div className="grid md:grid-cols-2 gap-12 items-start">
               <div className="space-y-6">
                 <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-gray-100 border-4 border-white shadow-2xl">
                    <img src={item.images?.[0] || 'https://via.placeholder.com/600x450'} className="w-full h-full object-cover" alt="main" />
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                   {item.images?.slice(1, 4).map((img: string, i: number) => (
                     <div key={i} className="aspect-square rounded-2xl overflow-hidden border-2 border-white shadow-lg">
                        <img src={img} className="w-full h-full object-cover" alt="thumb" />
                     </div>
                   ))}
                 </div>
               </div>
               
               <div className="space-y-8 text-right">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <span className="block text-gray-400 text-xs font-black mb-2 uppercase">قیمت / معاش</span>
                      <span className="text-2xl font-black text-[#a62626]">{item.price?.toLocaleString() || item.salary?.toLocaleString() || 'توافقی'} <small className="text-sm">افغانی</small></span>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <span className="block text-gray-400 text-xs font-black mb-2 uppercase">موقعیت</span>
                      <span className="text-xl font-black text-gray-800">{item.city}</span>
                    </div>
                  </div>

                  <div className="p-7 bg-red-50 rounded-[2.5rem] flex items-center justify-between border-2 border-red-100 shadow-xl shadow-red-900/5">
                    <div className="text-right">
                      <span className="block text-red-400 text-xs font-black mb-1 uppercase">شماره تماس مستقیم</span>
                      <span className="text-3xl font-black text-[#a62626] tracking-widest">{item.phoneNumber || 'نامشخص'}</span>
                    </div>
                    <div className="bg-white p-4 rounded-2xl text-[#a62626] shadow-sm"><Phone size={32} /></div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-black text-gray-400 text-xs uppercase underline decoration-red-200 decoration-4 underline-offset-4">توضیحات آگهی</h4>
                    <p className="text-gray-700 leading-10 text-xl bg-gray-50 p-8 rounded-[2rem] border border-gray-100 shadow-inner whitespace-pre-wrap text-justify">
                      {item.description}
                    </p>
                  </div>

                  {isEstate && (
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-5 bg-gray-50 rounded-2xl border flex justify-between items-center"><span className="text-gray-400 text-xs font-bold">مساحت</span> <span className="font-black">{item.area} متر</span></div>
                       <div className="p-5 bg-gray-50 rounded-2xl border flex justify-between items-center"><span className="text-gray-400 text-xs font-bold">اتاق</span> <span className="font-black">{item.bedrooms} اتاق</span></div>
                    </div>
                  )}
               </div>
            </div>
          </div>

          <div className="p-8 bg-gray-50 border-t flex gap-6 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
             {item.status === 'PENDING' && (
               <button 
                 onClick={() => handleAction(item.id, typeLabel, 'APPROVE')} 
                 disabled={!!isActionLoading}
                 className="flex-[3] bg-green-600 text-white py-5 rounded-[1.8rem] font-black text-xl shadow-2xl shadow-green-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:bg-green-300"
               >
                 {isActionLoading === item.id ? <Loader2 className="animate-spin" /> : <Check size={28} />} تایید و انتشار عمومی آگهی
               </button>
             )}
             <button 
               onClick={() => handleAction(item.id, typeLabel, 'DELETE')} 
               disabled={!!isActionLoading}
               className="flex-[1] bg-red-50 text-red-600 py-5 rounded-[1.8rem] font-black text-xl border border-red-100 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
               <Trash2 size={28} /> حذف
             </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] font-[Vazirmatn] flex flex-col h-screen overflow-hidden" dir="rtl">
      <header className="bg-gray-900 text-white px-8 py-5 flex justify-between items-center shrink-0 z-50 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40 animate-pulse"><Shield size={28} /></div>
          <div>
            <h1 className="text-xl font-black tracking-tight">پنل مدیریت افغانستان</h1>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">سیستم نظارت و تایید محتوا</p>
          </div>
        </div>
        <button onClick={onExit} className="bg-gray-800 hover:bg-red-600 px-6 py-2.5 rounded-xl text-sm font-black flex items-center gap-2 transition-all active:scale-95"><LogOut size={18} /> خروج از پنل</button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-white border-l hidden md:flex flex-col p-6 space-y-3 shrink-0 shadow-lg">
           <button onClick={() => setActiveTab('ESTATE')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black transition-all ${activeTab === 'ESTATE' ? 'bg-red-50 text-[#a62626] shadow-md shadow-red-900/5' : 'text-gray-400 hover:bg-gray-50'}`}><Home size={22} /> مدیریت املاک</button>
           <button onClick={() => setActiveTab('JOBS')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black transition-all ${activeTab === 'JOBS' ? 'bg-blue-50 text-blue-600 shadow-md shadow-blue-900/5' : 'text-gray-400 hover:bg-gray-50'}`}><Briefcase size={22} /> دندې (استخدام)</button>
           <button onClick={() => setActiveTab('SERVICES')} className={`w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-black transition-all ${activeTab === 'SERVICES' ? 'bg-orange-50 text-orange-600 shadow-md shadow-orange-900/5' : 'text-gray-400 hover:bg-gray-50'}`}><Wrench size={22} /> مدیریت خدمات</button>
        </aside>

        <main className="flex-1 overflow-y-auto p-10 no-scrollbar bg-gray-50/50 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-end mb-10 border-b pb-8 border-gray-200">
               <div>
                 <h2 className="text-3xl font-black text-gray-800 tracking-tight">بررسی آگهی‌ها</h2>
                 <p className="text-gray-400 text-sm font-bold mt-2">لیست موارد ثبت شده در انتظار تایید</p>
               </div>
               <div className="flex bg-white p-1.5 rounded-2xl border shadow-sm">
                 <button onClick={() => setStatusFilter('PENDING')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${statusFilter === 'PENDING' ? 'bg-amber-500 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>منتظر تایید</button>
                 <button onClick={() => setStatusFilter('APPROVED')} className={`px-8 py-2.5 rounded-xl text-xs font-black transition-all ${statusFilter === 'APPROVED' ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}>تایید شده</button>
               </div>
            </div>

            <div className="grid gap-6">
              {((activeTab === 'ESTATE' ? properties : activeTab === 'JOBS' ? jobs : services)
                .filter(it => it.status === statusFilter)).length === 0 ? (
                <div className="py-28 text-center bg-white rounded-[3rem] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center">
                  <Eye size={64} className="text-gray-100 mb-6" />
                  <p className="text-gray-400 font-black text-lg">در حال حاضر هیچ آگهی در این بخش وجود ندارد.</p>
                </div>
              ) : (
                (activeTab === 'ESTATE' ? properties : activeTab === 'JOBS' ? jobs : services)
                .filter(it => it.status === statusFilter)
                .map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="group bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-6 cursor-pointer hover:shadow-2xl hover:border-red-200 transition-all active:scale-[0.99]"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border-2 border-white shadow-md relative">
                       <img src={item.images?.[0] || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt="ad" />
                       {item.status === 'PENDING' && <div className="absolute top-1 right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></div>}
                    </div>
                    <div className="flex-1">
                       <h3 className="font-black text-xl text-gray-800 line-clamp-1 mb-2 group-hover:text-[#a62626] transition-colors">{item.title}</h3>
                       <div className="flex items-center gap-5 text-gray-400 text-xs font-bold">
                          <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg"><MapPin size={14} className="text-[#a62626]" /> {item.city}</span>
                          <span className="flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-lg text-[#a62626]"><Phone size={14} /> {item.phoneNumber}</span>
                       </div>
                    </div>
                    <div className="flex gap-3 shrink-0">
                       <div className="p-4 bg-gray-50 text-gray-400 rounded-2xl group-hover:bg-[#a62626] group-hover:text-white transition-all shadow-sm"><Eye size={24} /></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
      {renderPreviewModal()}
    </div>
  );
};

export default AdminPanel;
