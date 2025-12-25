
import { useState, useEffect } from 'react';
import { List, Search, User, Home, Briefcase, Globe, Building2, MapPinned, Plus, Loader2, Bookmark, ArrowRight, Wrench } from 'lucide-react';
import MapView from './components/MapView';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import AddPropertyModal from './components/AddPropertyModal';
import AddJobModal from './components/AddJobModal';
import AddServiceModal from './components/AddServiceModal';
import AuthModal from './components/AuthModal';
import JobCard from './components/JobCard';
import JobDetails from './components/JobDetails';
import ServiceCard from './components/ServiceCard';
import ServiceDetails from './components/ServiceDetails';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { PROPERTIES as MOCK_PROPERTIES, JOBS as MOCK_JOBS, SERVICES as MOCK_SERVICES, ADMINS } from './services/mockData';
import { Property, DealType, Job, Service, AppMode, AdminUser, Language } from './types';
import { translations } from './services/translations';
import { supabase, TABLES, isSupabaseReady } from './services/supabaseClient';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('app_lang') as Language) || 'dari');

  const [appMode, setAppMode] = useState<AppMode>('ESTATE');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedItem, setSelectedItem] = useState<Property | Job | Service | null>(null);
  const [mapFocusItem, setMapFocusItem] = useState<Property | Job | Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnlySaved, setShowOnlySaved] = useState(false);
  const [showOnlyMyAds, setShowOnlyMyAds] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [admins] = useState<AdminUser[]>(ADMINS);

  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('saved_ads');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [activeEstateFilter, setActiveEstateFilter] = useState<'ALL' | DealType>('ALL');
  const [cityFilter, setCityFilter] = useState('همه ولایات');

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('saved_ads', JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    // وقتی زبان تغییر می‌کند، اگر فیلتر ولایت روی پیش‌فرض بود، آن را به پیش‌فرض جدید تغییر بده
    if (cityFilter === translations['dari'].provinces[0] || cityFilter === translations['pashto'].provinces[0]) {
      setCityFilter(t.provinces[0]);
    }
  }, [lang]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!isSupabaseReady()) {
        const fixMock = (items: any[]) => items.map(it => ({
          ...it,
          images: it.images || (it.image ? [it.image] : [])
        }));
        setProperties(fixMock(MOCK_PROPERTIES));
        setJobs(fixMock(MOCK_JOBS));
        setServices(fixMock(MOCK_SERVICES));
        setIsLoading(false);
        return;
      }
      try {
        const { data: propData } = await supabase.from(TABLES.PROPERTIES).select('*').order('created_at', { ascending: false });
        setProperties((propData || []).map((p: any) => ({ 
          ...p, 
          dealType: p.deal_type, 
          type: p.property_type,
          phoneNumber: p.phone_number,
          ownerId: p.owner_id,
          images: p.images || [p.image] 
        })));

        const { data: jobData } = await supabase.from(TABLES.JOBS).select('*').order('created_at', { ascending: false });
        setJobs((jobData || []).map((j: any) => ({ 
          ...j, 
          jobType: j.job_type, 
          phoneNumber: j.phone_number,
          ownerId: j.owner_id,
          images: j.images || [j.image] 
        })));

        const { data: servData } = await supabase.from(TABLES.SERVICES).select('*').order('created_at', { ascending: false });
        setServices((servData || []).map((s: any) => ({ 
          ...s, 
          providerName: s.provider_name, 
          phoneNumber: s.phone_number,
          ownerId: s.owner_id,
          images: s.images || [s.image] 
        })));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();

    const handleHash = () => setIsAdminMode(window.location.hash.includes('admin'));
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  
  const handleSelectItem = (item: Property | Job | Service) => {
    setVisitedIds(prev => new Set(prev).add(item.id));
    setSelectedItem(item);
  };

  const handleShowOnMap = (item: Property | Job | Service) => {
    setMapFocusItem(item);
    setSelectedItem(null);
    setViewMode('map');
  };

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetFilters = () => {
    setAppMode('ESTATE');
    setShowOnlySaved(false);
    setShowOnlyMyAds(false);
    setActiveEstateFilter('ALL');
    setSearchTerm('');
    setCityFilter(t.provinces[0]);
    setViewMode('list');
  };

  const renderCard = (item: Property | Job | Service) => {
    const isSaved = savedIds.has(item.id);
    const isVisited = visitedIds.has(item.id);
    const onToggleSave = () => toggleSave(item.id);
    const onClick = () => handleSelectItem(item);

    if (appMode === 'ESTATE') {
      return <PropertyCard key={item.id} property={item as Property} onClick={onClick} isSaved={isSaved} isVisited={isVisited} onToggleSave={onToggleSave} />;
    } else if (appMode === 'JOBS') {
      return <JobCard key={item.id} job={item as Job} onClick={onClick} isSaved={isSaved} isVisited={isVisited} onToggleSave={onToggleSave} />;
    } else {
      return <ServiceCard key={item.id} service={item as Service} onClick={onClick} isSaved={isSaved} isVisited={isVisited} onToggleSave={onToggleSave} />;
    }
  };

  if (isAdminMode) {
    if (!adminUser) return <AdminLogin admins={admins} onLogin={setAdminUser} onCancel={() => { window.location.hash = ''; }} />;
    return <AdminPanel properties={properties} setProperties={setProperties} jobs={jobs} setJobs={setJobs} services={services} setServices={setServices} onExit={() => { window.location.hash = ''; }} />;
  }

  const filteredItems = (() => {
    let baseItems = appMode === 'ESTATE' ? properties : appMode === 'JOBS' ? jobs : services;
    return baseItems.filter(item => {
      const isOwner = item.ownerId === 'user_123';
      if (showOnlyMyAds) return isOwner;

      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstateFilter = appMode === 'ESTATE' ? (activeEstateFilter === 'ALL' || (item as Property).dealType === activeEstateFilter) : true;
      const matchesCity = cityFilter === t.provinces[0] || item.city === cityFilter || (lang === 'pashto' && item.city === translations['dari'].provinces[translations['pashto'].provinces.indexOf(cityFilter)]);
      const matchesSaved = showOnlySaved ? savedIds.has(item.id) : true;
      
      return item.status === 'APPROVED' && matchesSearch && matchesEstateFilter && matchesCity && matchesSaved;
    });
  })();

  const renderDetails = () => {
    if (!selectedItem) return null;
    if ('bedrooms' in selectedItem) return <PropertyDetails property={selectedItem as Property} onClose={() => setSelectedItem(null)} onShowOnMap={() => handleShowOnMap(selectedItem)} isSaved={savedIds.has(selectedItem.id)} onToggleSave={() => toggleSave(selectedItem.id)} t={t} />;
    if ('company' in selectedItem) return <JobDetails job={selectedItem as any} onClose={() => setSelectedItem(null)} onShowOnMap={() => handleShowOnMap(selectedItem)} isSaved={savedIds.has(selectedItem.id)} onToggleSave={() => toggleSave(selectedItem.id)} t={t} />;
    return <ServiceDetails service={selectedItem as any} onClose={() => setSelectedItem(null)} onShowOnMap={() => handleShowOnMap(selectedItem)} isSaved={savedIds.has(selectedItem.id)} onToggleSave={() => toggleSave(selectedItem.id)} t={t} />;
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-white font-[Vazirmatn] overflow-hidden" dir="rtl">
      <header className="h-16 border-b flex items-center justify-between px-4 md:px-8 bg-white sticky top-0 z-[3000] shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={resetFilters}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-transform ${appMode === 'JOBS' ? 'bg-blue-600' : appMode === 'SERVICES' ? 'bg-orange-600' : 'bg-[#a62626]'}`}><Building2 size={20} /></div>
            <span className={`text-sm font-black hidden xs:block ${appMode === 'JOBS' ? 'text-blue-600' : appMode === 'SERVICES' ? 'text-orange-600' : 'text-[#a62626]'}`}>افغان اپ</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(l => l === 'dari' ? 'pashto' : 'dari')} className="bg-gray-100 p-2 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-gray-200 transition-colors">
            <Globe size={14} className="text-[#a62626]" /> <span>{lang === 'dari' ? 'دری' : 'پښتو'}</span>
          </button>
          
          <button onClick={() => setShowAuthModal(true)} className="p-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            <User size={20} />
          </button>

          <button onClick={() => setShowAddModal(true)} className={`${appMode === 'JOBS' ? 'bg-blue-600' : appMode === 'SERVICES' ? 'bg-orange-600' : 'bg-[#a62626]'} text-white px-4 py-2.5 rounded-xl font-black text-xs shadow-xl active:scale-95 transition-all`}>{t.add_post}</button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`flex-1 md:w-[380px] md:flex-none bg-gray-50 flex flex-col border-l transition-all duration-300 ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <div className="bg-white p-3 shadow-sm z-[100] space-y-3">
             {showOnlyMyAds ? (
               <div className="flex items-center justify-between bg-red-50 p-3 rounded-2xl border border-red-100">
                 <span className="text-xs font-black text-[#a62626]">{t.my_ads}</span>
                 <button onClick={() => setShowOnlyMyAds(false)} className="text-xs font-bold flex items-center gap-1 text-gray-500 hover:text-gray-800">بازگشت <ArrowRight size={14} /></button>
               </div>
             ) : (
               <>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                      <input type="text" placeholder={appMode === 'ESTATE' ? t.search_estate : appMode === 'JOBS' ? t.search_jobs : t.search_services} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-100 border-none rounded-xl pr-9 pl-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#a62626]/10 transition-all" />
                    </div>
                    <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="bg-gray-100 border-none rounded-xl px-3 text-xs font-bold outline-none max-w-[120px]">
                      {t.provinces.map((p: string) => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  <button onClick={() => {setActiveEstateFilter('ALL'); setShowOnlySaved(false);}} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeEstateFilter === 'ALL' && !showOnlySaved ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.all}</button>
                  {appMode === 'ESTATE' && (
                    <>
                      <button onClick={() => {setActiveEstateFilter(DealType.SALE); setShowOnlySaved(false);}} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeEstateFilter === DealType.SALE ? 'bg-[#a62626] text-white' : 'bg-gray-100 text-gray-500'}`}>{t.sale}</button>
                      <button onClick={() => {setActiveEstateFilter(DealType.RENT); setShowOnlySaved(false);}} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeEstateFilter === DealType.RENT ? 'bg-[#a62626] text-white' : 'bg-gray-100 text-gray-500'}`}>{t.rent}</button>
                      <button onClick={() => {setActiveEstateFilter(DealType.MORTGAGE); setShowOnlySaved(false);}} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeEstateFilter === DealType.MORTGAGE ? 'bg-[#a62626] text-white' : 'bg-gray-100 text-gray-500'}`}>{t.mortgage}</button>
                    </>
                  )}
                  <button onClick={() => {setShowOnlySaved(!showOnlySaved); setShowOnlyMyAds(false);}} className={`px-4 py-2 rounded-xl text-[10px] font-black whitespace-nowrap flex items-center gap-1.5 transition-all ${showOnlySaved ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}><Bookmark size={12} className={showOnlySaved ? "fill-amber-600" : ""}/> {t.saved}</button>
                </div>
               </>
             )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
            {isLoading ? <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#a62626]" size={24} /></div> : filteredItems.length === 0 ? <div className="text-center py-20 text-gray-400 text-xs font-bold">{t.no_results}</div> : filteredItems.map(item => renderCard(item))}
            <div className="h-28"></div>
          </div>
        </div>
        <div className={`flex-1 bg-gray-100 relative ${viewMode === 'list' ? 'hidden md:block' : 'block w-full h-full'}`}>
          <MapView items={filteredItems} selectedItem={mapFocusItem} onSelectItem={handleSelectItem} mode={appMode} visitedIds={visitedIds} />
        </div>
        <button onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')} className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 bg-white text-[#a62626] px-5 py-3 rounded-2xl shadow-2xl z-[5000] flex items-center gap-2 font-black border border-[#a62626]/10 text-xs active:scale-95 transition-transform">
          {viewMode === 'map' ? <><List size={16} /> {t.list}</> : <><MapPinned size={16} /> {t.map}</>}
        </button>
      </div>

      <nav className="h-16 border-t bg-white flex items-center justify-around fixed bottom-0 left-0 right-0 z-[4000] safe-area-bottom px-4 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <button 
          onClick={() => {setAppMode('ESTATE'); setShowOnlySaved(false); setShowOnlyMyAds(false); setViewMode('list'); setActiveEstateFilter('ALL');}} 
          className={`flex flex-col items-center flex-1 gap-1 transition-all ${appMode === 'ESTATE' ? 'text-[#a62626]' : 'text-gray-400'}`}
        >
          <Home size={22} /><span className="text-[9px] font-black">{t.estate}</span>
        </button>
        
        <button 
          onClick={() => {setAppMode('JOBS'); setShowOnlySaved(false); setShowOnlyMyAds(false); setViewMode('list');}} 
          className={`flex flex-col items-center flex-1 gap-1 transition-all ${appMode === 'JOBS' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <Briefcase size={22} /><span className="text-[9px] font-black">{t.jobs}</span>
        </button>

        <button 
          onClick={() => setShowAddModal(true)} 
          className={`-mt-10 w-14 h-14 rounded-[1.3rem] flex items-center justify-center text-white shadow-2xl border-4 border-white active:scale-90 transition-transform ${appMode === 'JOBS' ? 'bg-blue-600' : appMode === 'SERVICES' ? 'bg-orange-600' : 'bg-[#a62626]'}`}
        >
          <Plus size={28} />
        </button>

        <button 
          onClick={() => {setAppMode('SERVICES'); setShowOnlySaved(false); setShowOnlyMyAds(false); setViewMode('list');}} 
          className={`flex flex-col items-center flex-1 gap-1 transition-all ${appMode === 'SERVICES' ? 'text-orange-600' : 'text-gray-400'}`}
        >
          <Wrench size={22} /><span className="text-[9px] font-black">{t.services}</span>
        </button>

        <button 
          onClick={() => setShowAuthModal(true)} 
          className={`flex flex-col items-center flex-1 gap-1 transition-all ${showAuthModal ? 'text-gray-800' : 'text-gray-400'}`}
        >
          <User size={22} /><span className="text-[9px] font-black">{t.account}</span>
        </button>
      </nav>

      {renderDetails()}
      {showAddModal && (
        appMode === 'ESTATE' ? <AddPropertyModal onClose={() => setShowAddModal(false)} t={t} /> :
        appMode === 'JOBS' ? <AddJobModal onClose={() => setShowAddModal(false)} t={t} /> :
        <AddServiceModal onClose={() => setShowAddModal(false)} t={t} />
      )}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} lang={lang} onShowMyAds={() => { setShowOnlyMyAds(true); setShowOnlySaved(false); setViewMode('list'); }} onShowSaved={() => { setShowOnlySaved(true); setShowOnlyMyAds(false); setViewMode('list'); }} />}
    </div>
  );
}
export default App;
