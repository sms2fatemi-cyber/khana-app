
import React, { useState, useEffect, useMemo } from 'react';
import { Property, Job, Service, AdminUser } from '../types';
import { Check, Trash2, Home, Briefcase, Wrench, Shield, X, Key, FileText, AlertCircle, LayoutDashboard, ChevronLeft, Loader2, Users, UserPlus, Lock } from 'lucide-react';
import { ADMINS as initialAdmins } from '../services/mockData';
import { supabase, TABLES } from '../services/supabaseClient';

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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ESTATE' | 'JOBS' | 'SERVICES' | 'ADMINS' | 'PROFILE'>('DASHBOARD');
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // مدیریت لیست ادمین‌ها
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('admins_list');
    return saved ? JSON.parse(saved) : initialAdmins;
  });
  
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser>(() => {
    const saved = localStorage.getItem('current_admin_user');
    return saved ? JSON.parse(saved) : admins[0];
  });

  const [newAdmin, setNewAdmin] = useState({ username: '', password: '', fullName: '' });
  const [passwordForm, setPasswordForm] = useState({ old: '', new: '' });

  useEffect(() => {
    localStorage.setItem('admins_list', JSON.stringify(admins));
  }, [admins]);

  const stats = useMemo(() => {
    const all = [...properties, ...jobs, ...services];
    return {
      totalPosts: all.length,
      pendingPosts: all.filter(it => it.status === 'PENDING').length,
      approvedCount: all.filter(it => it.status === 'APPROVED').length,
    };
  }, [properties, jobs, services]);

  const handleAction = async (id: string, action: 'APPROVE' | 'DELETE') => {
    setIsProcessing(true);
    try {
      let tableName = '';
      if (activeTab === 'ESTATE') tableName = TABLES.PROPERTIES;
      else if (activeTab === 'JOBS') tableName = TABLES.JOBS;
      else if (activeTab === 'SERVICES') tableName = TABLES.SERVICES;

      if (action === 'DELETE') {
        const { error } = await supabase.from(tableName).delete().eq('id', id);
        if (error) throw error;
        if (activeTab === 'ESTATE') setProperties(prev => prev.filter(it => it.id !== id));
        else if (activeTab === 'JOBS') setJobs(prev => prev.filter(it => it.id !== id));
        else if (activeTab === 'SERVICES') setServices(prev => prev.filter(it => it.id !== id));
      } else {
        const { error } = await supabase.from(tableName).update({ status: 'APPROVED' }).eq('id', id);
        if (error) throw error;
        const updateState = (list: any[]) => list.map(it => it.id === id ? { ...it, status: 'APPROVED' } : it);
        if (activeTab === 'ESTATE') setProperties(updateState(properties));
        else if (activeTab === 'JOBS') setJobs(updateState(jobs));
        else if (activeTab === 'SERVICES') setServices(updateState(services));
      }
      setSelectedItem(null);
    } catch (err) {
      alert("خطا در عملیات.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddAdmin = () => {
    if (!newAdmin.username || !newAdmin.password) return alert("فیلدها را پر کنید");
    const admin: AdminUser = { 
      id: Date.now().toString(), 
      username: newAdmin.username, 
      password: newAdmin.password, 
      fullName: newAdmin.fullName || 'ادمین جدید',
      role: 'NORMAL' 
    };
    setAdmins([...admins, admin]);
    setNewAdmin({ username: '', password: '', fullName: '' });
    alert("ادمین با موفقیت اضافه شد.");
  };

  const handleUpdatePassword = () => {
    if (passwordForm.old !== currentAdmin.password) return alert("رمز فعلی اشتباه است");
    const updatedAdmins = admins.map(a => a.id === currentAdmin.id ? { ...a, password: passwordForm.new } : a);
    setAdmins(updatedAdmins);
    setCurrentAdmin({ ...currentAdmin, password: passwordForm.new });
    setPasswordForm({ old: '', new: '' });
    alert("رمز عبور با موفقیت تغییر کرد.");
  };

  const navItems = [
    { id: 'DASHBOARD', label: 'داشبورد', icon: LayoutDashboard },
    { id: 'ESTATE', label: 'املاک', icon: Home },
    { id: 'JOBS', label: 'استخدام', icon: Briefcase },
    { id: 'SERVICES', label: 'خدمات', icon: Wrench },
    { id: 'ADMINS', label: 'ادمین‌ها', icon: Users, superOnly: true },
    { id: 'PROFILE', label: 'تنظیمات', icon: Key },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-[Vazirmatn] flex flex-col h-screen overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center z-50 shadow-xl shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-red-500" />
          <h1 className="text-sm font-black uppercase">پنل مدیریت عالی</h1>
        </div>
        <button onClick={onExit} className="bg-red-600 px-4 py-2 rounded-xl text-xs font-black">خروج</button>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex w-64 bg-white border-l p-4 flex-col gap-1.5 shrink-0 shadow-xl">
           {navItems.map((item) => (
             (!item.superOnly || currentAdmin.role === 'SUPER') && (
               <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-[1.2rem] font-black transition-all ${activeTab === item.id ? 'bg-[#a62626] text-white' : 'text-gray-400 hover:bg-gray-50'}`}>
                 <item.icon size={20} /> <span className="text-sm">{item.label}</span>
               </button>
             )
           ))}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar bg-[#FDFEFF] pb-24">
          <div className="max-w-4xl mx-auto">
            {activeTab === 'DASHBOARD' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-8 rounded-[2rem] border shadow-sm text-center">
                   <FileText className="text-blue-500 mx-auto mb-2" size={32} />
                   <span className="text-gray-400 text-xs font-black block mb-1">کل آگهی‌ها</span>
                   <span className="text-3xl font-black">{stats.totalPosts}</span>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border shadow-sm text-center">
                   <AlertCircle className="text-amber-500 mx-auto mb-2" size={32} />
                   <span className="text-gray-400 text-xs font-black block mb-1">در انتظار تایید</span>
                   <span className="text-3xl font-black text-amber-600">{stats.pendingPosts}</span>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border shadow-sm text-center">
                   <Check className="text-green-500 mx-auto mb-2" size={32} />
                   <span className="text-gray-400 text-xs font-black block mb-1">تایید شده</span>
                   <span className="text-3xl font-black text-green-600">{stats.approvedCount}</span>
                </div>
              </div>
            )}

            {['ESTATE', 'JOBS', 'SERVICES'].includes(activeTab) && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-black">مدیریت {activeTab === 'ESTATE' ? 'املاک' : activeTab === 'JOBS' ? 'استخدام' : 'خدمات'}</h2>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                      <button onClick={() => setStatusFilter('PENDING')} className={`px-4 py-2 rounded-lg text-[10px] font-black ${statusFilter === 'PENDING' ? 'bg-[#a62626] text-white' : 'text-gray-500'}`}>در انتظار</button>
                      <button onClick={() => setStatusFilter('APPROVED')} className={`px-4 py-2 rounded-lg text-[10px] font-black ${statusFilter === 'APPROVED' ? 'bg-green-600 text-white' : 'text-gray-500'}`}>تایید شده</button>
                    </div>
                 </div>
                 <div className="grid gap-3">
                   {(activeTab === 'ESTATE' ? properties : activeTab === 'JOBS' ? jobs : services)
                     .filter(it => it.status === statusFilter)
                     .map(item => (
                       <div key={item.id} onClick={() => setSelectedItem(item)} className="bg-white rounded-2xl p-4 border flex items-center gap-4 transition-all">
                          <img src={item.images?.[0]} className="w-14 h-14 rounded-xl object-cover bg-gray-100" />
                          <div className="flex-1">
                             <h3 className="font-black text-sm truncate">{item.title}</h3>
                             <p className="text-[10px] text-gray-400 font-bold">{item.city} | {item.phoneNumber}</p>
                          </div>
                          <ChevronLeft size={20} className="text-gray-300" />
                       </div>
                     ))}
                 </div>
              </div>
            )}

            {activeTab === 'ADMINS' && (
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-[2rem] border">
                  <h3 className="text-lg font-black mb-6 flex items-center gap-2"><UserPlus className="text-red-600" /> افزودن ادمین جدید</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input type="text" placeholder="نام و تخلص" value={newAdmin.fullName} onChange={e => setNewAdmin({...newAdmin, fullName: e.target.value})} className="bg-gray-50 border p-4 rounded-2xl text-sm font-bold outline-none" />
                    <input type="text" placeholder="نام کاربری" value={newAdmin.username} onChange={e => setNewAdmin({...newAdmin, username: e.target.value})} className="bg-gray-50 border p-4 rounded-2xl text-sm font-bold outline-none" />
                    <input type="password" placeholder="رمز عبور" value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} className="bg-gray-50 border p-4 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                  <button onClick={handleAddAdmin} className="mt-6 w-full bg-[#a62626] text-white py-4 rounded-2xl font-black shadow-lg active:scale-95">ثبت ادمین جدید</button>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border">
                   <h3 className="text-lg font-black mb-6">لیست ادمین‌های فعلی</h3>
                   <div className="space-y-3">
                     {admins.map(a => (
                       <div key={a.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border">
                          <div>
                            <p className="font-black text-sm">{a.fullName}</p>
                            <p className="text-[10px] text-gray-400 font-bold">نام کاربری: {a.username} | نقش: {a.role === 'SUPER' ? 'مدیر ارشد' : 'مدیر عادی'}</p>
                          </div>
                          {a.role !== 'SUPER' && <button onClick={() => setAdmins(admins.filter(x => x.id !== a.id))} className="text-red-500 p-2"><Trash2 size={20} /></button>}
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'PROFILE' && (
              <div className="bg-white p-8 rounded-[2rem] border max-w-md mx-auto">
                <h3 className="text-lg font-black mb-6 flex items-center gap-2"><Lock className="text-red-600" /> تغییر رمز عبور</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 block mb-1">رمز عبور فعلی</label>
                    <input type="password" value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 block mb-1">رمز عبور جدید</label>
                    <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} className="w-full bg-gray-50 border p-4 rounded-2xl text-sm font-bold outline-none" />
                  </div>
                  <button onClick={handleUpdatePassword} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black shadow-lg active:scale-95 mt-4">بروزرسانی رمز عبور</button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Scrollable for more items */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex overflow-x-auto no-scrollbar justify-between items-center p-2 z-[60] shadow-2xl safe-area-bottom">
        {navItems.map((item) => (
          (!item.superOnly || currentAdmin.role === 'SUPER') && (
            <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={`flex flex-col items-center gap-1 p-3 min-w-[70px] shrink-0 ${activeTab === item.id ? 'text-[#a62626]' : 'text-gray-300'}`}>
              <item.icon size={20} />
              <span className="text-[9px] font-black whitespace-nowrap">{item.label}</span>
            </button>
          )
        ))}
      </nav>

      {/* Action Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[12000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => !isProcessing && setSelectedItem(null)}>
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b flex justify-between items-center bg-gray-50">
               <h2 className="font-black truncate text-sm">{selectedItem.title}</h2>
               <button onClick={() => setSelectedItem(null)} className="p-2 bg-gray-200 rounded-full"><X size={20} /></button>
            </div>
            <div className="p-6">
               <img src={selectedItem.images?.[0]} className="w-full h-40 rounded-2xl object-cover border mb-4" />
               <div className="bg-gray-50 p-4 rounded-xl border">
                  <span className="text-lg font-black text-[#a62626]">{selectedItem.phoneNumber}</span>
               </div>
            </div>
            <div className="p-5 border-t flex gap-3">
               {selectedItem.status === 'PENDING' && (
                 <button disabled={isProcessing} onClick={() => handleAction(selectedItem.id, 'APPROVE')} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-95">
                   {isProcessing ? <Loader2 className="animate-spin" /> : <Check />} تایید
                 </button>
               )}
               <button disabled={isProcessing} onClick={() => handleAction(selectedItem.id, 'DELETE')} className="bg-red-100 text-red-600 px-6 rounded-2xl flex items-center justify-center active:scale-95"><Trash2 size={24} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
