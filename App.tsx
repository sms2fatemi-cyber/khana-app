import { useState, useEffect } from 'react';
import { List, Search, User, Home, Briefcase, Globe, Building2, MapPinned, Loader2, Wrench, SlidersHorizontal } from 'lucide-react';
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
import { Property, DealType, Job, Service, AppMode, AdminUser, Language, PropertyType } from './types';
import { translations } from './services/translations';
import { supabase, TABLES, isSupabaseReady } from './services/supabaseClient';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const lang = (localStorage.getItem('app_lang') as Language) || 'dari';

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
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<'ALL' | PropertyType>('ALL');
  const [cityFilter, setCityFilter] = useState('همه ولایات');

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('saved_ads', JSON.stringify(Array.from(savedIds)));
  }, [savedIds]);

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
          images: p.images || (p.image ? [p.image] : [])
        })));

        const { data: jobData } = await supabase.from(TABLES.JOBS).select('*').order('created_at', { ascending: false });
        setJobs((jobData || []).map((j: any) => ({ 
          ...j, 
          jobType: j.job_type, 
          phoneNumber: j.phone_number,
          ownerId: j.owner_id,
          images: j.images || (j.image ? [j.image] : [])
        })));

        const { data: servData } = await supabase.from(TABLES.SERVICES).select('*').order('created_at', { ascending: false });
        setServices((servData || []).map((s: any) => ({ 
          ...s, 
          providerName: s.provider_name, 
          phoneNumber: s.phone_number,
          ownerId: s.owner_id,
          images: s.images || (s.image ? [s.image] : [])
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
    const type = 'bedrooms' in item ? 'estate' : 'company' in item ? 'job' : 'service';
    const newUrl = `${window.location.origin}${window.location.pathname}?id=${item.id}&type=${type}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  const handleCloseDetails = () => {
    setSelectedItem(null);
    const newUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
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
    setPropertyTypeFilter('ALL');
    setSearchTerm('');
    setCityFilter(t.provinces[0]);
    setViewMode('list');
  };

  const filteredItems = (() => {
    let baseItems = appMode === 'ESTATE' ? properties : appMode === 'JOBS' ? jobs : services;
    return baseItems.filter(item => {
      if (showOnlyMyAds) return item.ownerId === 'user_123';
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === t.provinces[0] || item.city === cityFilter;
      const matchesSaved = showOnlySaved ? savedIds.has(item.id) : true;
      
      if (appMode === 'ESTATE') {
        const p = item as Property;
        const matchesDeal = activeEstateFilter === 'ALL' || p.dealType === activeEstateFilter;
        const matchesType = propertyTypeFilter === 'ALL' || p.type === propertyTypeFilter;
        return p.status === 'APPROVED' && matchesSearch && matchesCity && matchesSaved && matchesDeal && matchesType;
      }
      
      return item.status === 'APPROVED' && matchesSearch && matchesCity && matchesSaved;
    });
  })();

  const renderCard = (item: Property | Job | Service) => {
    const isSaved = savedIds.has(item.id);
    const isVisited = visitedIds.has(item.id);
    if (appMode === 'ESTATE') return <PropertyCard key={item.id} property={item as Property} onClick={() => handleSelectItem(item)} isSaved={isSaved} isVisited={isVisited} />;
    if (appMode === 'JOBS') return <JobCard key={item.id} job={item as Job} onClick={() => handleSelectItem(item)} isSaved={isSaved} isVisited={isVisited} onToggleSave={() => toggleSave(item.id)} />;
    return <ServiceCard key={item.id} service={item as Service} onClick={() => handleSelectItem(item)} isSaved={isSaved} isVisited={isVisited} onToggleSave={() => toggleSave(item.id)} />;
  };

  if (isAdminMode) {
    if (!adminUser) return <AdminLogin admins={admins} onLogin={setAdminUser} onCancel={() => { window.location.hash = ''; }} />;
    return <AdminPanel properties={properties} setProperties={setProperties} jobs={jobs} setJobs={setJobs} services={services} setServices={setServices} onExit={() => { window.location.hash = ''; }} />;
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-white font-[Vazirmatn] overflow-hidden" dir="rtl">
      {/* هدر اصلی سبک دیوار */}
      <header className="h-14 border-b flex items-center justify-between px-4 bg-white sticky top-0 z-[3000] shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={resetFilters} className="text-[#a62626] font-black text-xl flex items-center gap-1">
             <div className="w-8 h-8 bg-[#a62626] text-white rounded-lg flex items-center justify-center"><Building2 size={20} /></div>
             <span>خانه</span>
          </button>
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <div className="flex items-center gap-1 text-gray-500 text-[13px] font-bold">
            <Globe size={16} />
            <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="bg-transparent border-none outline-none appearance-none cursor-pointer">
              {t.provinces.map((p: string) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowAddModal(true)} className="bg-[#a62626] text-white px-4 py-1.5 rounded-lg font-black text-[12px] shadow-lg shadow-red-900/10 active:scale-95 transition-all">ثبت آگهی</button>
        </div>
      </header>

      {/* نوار جستجوی تخت دیوار */}
      <div className="px-4 py-3 border-b bg-white flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder={appMode === 'ESTATE' ? "جستجو در املاک..." : "جستجو..."} 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-gray-100 border-none rounded-xl pr-10 pl-4 py-2.5 text-[14px] font-bold outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <button className="p-2.5 bg-gray-100 text-gray-500 rounded-xl">
           <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* فیلترهای سریع املاک */}
      {appMode === 'ESTATE' && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 bg-white border-b items-center">
          <button onClick={() => setActiveEstateFilter('ALL')} className={`px-5 py-1.5 rounded-full text-[12px] font-black whitespace-nowrap border ${activeEstateFilter === 'ALL' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>همه آگهی‌ها</button>
          <button onClick={() => setActiveEstateFilter(DealType.SALE)} className={`px-5 py-1.5 rounded-full text-[12px] font-black whitespace-nowrap border ${activeEstateFilter === DealType.SALE ? 'bg-red-50 text-[#a62626] border-[#a62626]' : 'bg-white text-gray-600 border-gray-200'}`}>خرید و فروش</button>
          <button onClick={() => setActiveEstateFilter(DealType.RENT)} className={`px-5 py-1.5 rounded-full text-[12px] font-black whitespace-nowrap border ${activeEstateFilter === DealType.RENT ? 'bg-red-50 text-[#a62626] border-[#a62626]' : 'bg-white text-gray-600 border-gray-200'}`}>اجاره</button>
          <div className="h-4 w-[1px] bg-gray-200 shrink-0 mx-1"></div>
          {Object.values(PropertyType).map(type => (
             <button key={type} onClick={() => setPropertyTypeFilter(type)} className={`px-5 py-1.5 rounded-full text-[12px] font-black whitespace-nowrap border ${propertyTypeFilter === type ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>{type}</button>
          ))}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`flex-1 md:w-[450px] md:flex-none bg-white flex flex-col border-l transition-all ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-300" size={32} /></div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 font-bold">آگهی یافت نشد.</p>
                <button onClick={resetFilters} className="text-[#a62626] font-black mt-2 text-sm">حذف تمام فیلترها</button>
              </div>
            ) : (
              filteredItems.map(item => renderCard(item))
            )}
          </div>
        </div>
        
        <div className={`flex-1 bg-gray-50 relative ${viewMode === 'list' ? 'hidden md:block' : 'block w-full h-full'}`}>
          <MapView items={filteredItems} selectedItem={mapFocusItem} onSelectItem={handleSelectItem} mode={appMode} visitedIds={visitedIds} />
        </div>

        <button onClick={() => setViewMode(v => v === 'list' ? 'map' : 'list')} className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl z-[5000] flex items-center gap-2 font-black text-xs active:scale-95 transition-all">
          {viewMode === 'map' ? <><List size={18} /> لیست آگهی‌ها</> : <><MapPinned size={18} /> مشاهده روی نقشه</>}
        </button>
      </div>

      <nav className="h-16 border-t bg-white flex items-center justify-around fixed bottom-0 left-0 right-0 z-[4000] safe-area-bottom shadow-[0_-2px_15px_rgba(0,0,0,0.08)]">
        <button onClick={() => setAppMode('ESTATE')} className={`flex flex-col items-center flex-1 gap-1 ${appMode === 'ESTATE' ? 'text-[#a62626]' : 'text-gray-400'}`}>
          <Home size={22} className={appMode === 'ESTATE' ? 'fill-[#a62626]/10' : ''} /><span className="text-[10px] font-black">آگهی‌ها</span>
        </button>
        <button onClick={() => setAppMode('JOBS')} className={`flex flex-col items-center flex-1 gap-1 ${appMode === 'JOBS' ? 'text-blue-600' : 'text-gray-400'}`}>
          <Briefcase size={22} /><span className="text-[10px] font-black">استخدام</span>
        </button>
        <button onClick={() => setAppMode('SERVICES')} className={`flex flex-col items-center flex-1 gap-1 ${appMode === 'SERVICES' ? 'text-orange-600' : 'text-gray-400'}`}>
          <Wrench size={22} /><span className="text-[10px] font-black">خدمات</span>
        </button>
        <button onClick={() => {setShowAuthModal(true);}} className={`flex flex-col items-center flex-1 gap-1 text-gray-400`}>
          <User size={22} /><span className="text-[10px] font-black">دیوار من</span>
        </button>
      </nav>

      {'bedrooms' in (selectedItem || {}) ? (
        <PropertyDetails property={selectedItem as Property} onClose={handleCloseDetails} onShowOnMap={() => handleShowOnMap(selectedItem!)} isSaved={savedIds.has(selectedItem!.id)} onToggleSave={() => toggleSave(selectedItem!.id)} t={t} />
      ) : selectedItem && 'company' in selectedItem ? (
        <JobDetails job={selectedItem as any} onClose={handleCloseDetails} onShowOnMap={() => handleShowOnMap(selectedItem)} isSaved={savedIds.has(selectedItem.id)} onToggleSave={() => toggleSave(selectedItem.id)} t={t} />
      ) : selectedItem && (
        <ServiceDetails service={selectedItem as any} onClose={handleCloseDetails} onShowOnMap={() => handleShowOnMap(selectedItem)} isSaved={savedIds.has(selectedItem.id)} onToggleSave={() => toggleSave(selectedItem.id)} t={t} />
      )}

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