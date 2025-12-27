
import { useState, useMemo, useEffect } from 'react';
import { Search, User, Briefcase, Building2, Wrench, Plus, List, Globe, Map as MapIcon, MapPin } from 'lucide-react';
import MapView from './components/MapView';
import PropertyCard from './components/PropertyCard';
import PropertyDetails from './components/PropertyDetails';
import JobCard from './components/JobCard';
import JobDetails from './components/JobDetails';
import ServiceCard from './components/ServiceCard';
import ServiceDetails from './components/ServiceDetails';
import AddPropertyModal from './components/AddPropertyModal';
import AddJobModal from './components/AddJobModal';
import AddServiceModal from './components/AddServiceModal';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import { PROPERTIES as initialProperties, JOBS as initialJobs, SERVICES as initialServices, ADMINS } from './services/mockData';
import { Property, Job, Service, AppMode, Language, DealType } from './types';
import { translations } from './services/translations';

function App() {
  const [lang, setLang] = useState<Language>((localStorage.getItem('app_lang') as Language) || 'dari');
  const t = translations[lang];

  const [appMode, setAppMode] = useState<AppMode>('ESTATE');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedItem, setSelectedItem] = useState<Property | Job | Service | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(t.provinces[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeDealFilter, setActiveDealFilter] = useState<'ALL' | DealType>('ALL');
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  // Admin States
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [services, setServices] = useState<Service[]>(initialServices);

  useEffect(() => {
    localStorage.setItem('app_lang', lang);
    setSelectedProvince(t.provinces[0]);
  }, [lang, t.provinces]);

  useEffect(() => {
    setSelectedItem(null);
    setIsDetailOpen(false);
    setSearchTerm('');
  }, [appMode]);

  const toggleLanguage = () => {
    setLang(prev => prev === 'dari' ? 'pashto' : 'dari');
  };

  const filteredItems = useMemo(() => {
    let base = appMode === 'ESTATE' ? properties : appMode === 'JOBS' ? jobs : services;
    return base.filter(item => {
      if (item.status !== 'APPROVED') return false;
      const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const provinceMatch = selectedProvince === t.provinces[0] || item.city === selectedProvince;
      
      if (appMode === 'ESTATE') {
        const p = item as Property;
        const dealMatch = activeDealFilter === 'ALL' || p.dealType === activeDealFilter;
        return titleMatch && dealMatch && provinceMatch;
      }
      return titleMatch && provinceMatch;
    });
  }, [appMode, searchTerm, activeDealFilter, selectedProvince, t.provinces, properties, jobs, services]);

  const handleSelectItem = (item: Property | Job | Service) => {
    setVisitedIds(prev => new Set(prev).add(item.id));
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleShowOnMap = (item: any) => {
    setSelectedItem(item);
    setIsDetailOpen(false);
    setViewMode('map');
  };

  if (isAdminMode) {
    return (
      <AdminPanel 
        properties={properties} setProperties={setProperties}
        jobs={jobs} setJobs={setJobs}
        services={services} setServices={setServices}
        onExit={() => setIsAdminMode(false)} 
      />
    );
  }

  const renderCard = (item: any) => {
    if (appMode === 'ESTATE') {
      return <PropertyCard key={item.id} property={item as Property} onClick={() => handleSelectItem(item)} isVisited={visitedIds.has(item.id)} />;
    } else if (appMode === 'JOBS') {
      return <JobCard key={item.id} job={item as Job} onClick={() => handleSelectItem(item)} isVisited={visitedIds.has(item.id)} />;
    } else {
      return <ServiceCard key={item.id} service={item as Service} onClick={() => handleSelectItem(item)} isVisited={visitedIds.has(item.id)} />;
    }
  };

  const renderDetails = () => {
    if (!selectedItem || !isDetailOpen) return null;
    if (appMode === 'ESTATE') {
      return <PropertyDetails property={selectedItem as Property} onClose={() => setIsDetailOpen(false)} onShowOnMap={() => handleShowOnMap(selectedItem)} isSaved={false} onToggleSave={() => {}} t={t} />;
    } else if (appMode === 'JOBS') {
      return <JobDetails job={selectedItem as Job} onClose={() => setIsDetailOpen(false)} onShowOnMap={() => handleShowOnMap(selectedItem)} isSaved={false} onToggleSave={() => {}} t={t} />;
    } else if (appMode === 'SERVICES') {
      return <ServiceDetails service={selectedItem as Service} onClose={() => setIsDetailOpen(false)} onShowOnMap={() => handleShowOnMap(selectedItem)} isSaved={false} onToggleSave={() => {}} t={t} />;
    }
    return null;
  };

  const renderAddModal = () => {
    if (!showAddModal) return null;
    if (appMode === 'ESTATE') return <AddPropertyModal onClose={() => setShowAddModal(false)} t={t} />;
    if (appMode === 'JOBS') return <AddJobModal onClose={() => setShowAddModal(false)} t={t} />;
    if (appMode === 'SERVICES') return <AddServiceModal onClose={() => setShowAddModal(false)} t={t} />;
    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FA] font-[Vazirmatn] overflow-hidden select-none" dir="rtl">
      {/* Header - Compact */}
      <header className="h-[55px] bg-white border-b flex items-center justify-between px-4 z-[3000] shrink-0 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Desktop Only buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => setShowAddModal(true)} className="bg-[#a62626] text-white px-4 py-1.5 rounded-lg font-black text-xs shadow-md active:scale-95 transition-all">{t.add_post}</button>
            <button onClick={() => setShowAuthModal(true)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all"><User size={20} /></button>
          </div>
          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700 font-black text-[10px] active:scale-95 transition-all border border-gray-200"
          >
            <Globe size={14} className="text-[#a62626]" />
            <span>{lang === 'dari' ? 'پښتو' : 'دری'}</span>
          </button>
          {/* Mobile Only: Map/List Toggle inside Header */}
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="md:hidden bg-gray-900 text-white px-3 py-1.5 rounded-lg font-black text-[10px] flex items-center gap-1.5 shadow-sm active:scale-95 transition-all mr-1"
          >
            {viewMode === 'list' ? (
              <><MapIcon size={14} /> <span>{t.map}</span></>
            ) : (
              <><List size={14} /> <span>{t.list}</span></>
            )}
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right"><h1 className="font-black text-[#a62626] text-base leading-none">{lang === 'dari' ? 'خانه' : 'کور'}</h1></div>
          <div className="w-8 h-8 bg-[#a62626] rounded-xl flex items-center justify-center shadow-lg"><Building2 size={18} className="text-white" /></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* List Content */}
        <div className={`w-full md:w-[420px] lg:w-[460px] h-full flex flex-col bg-white z-20 shrink-0 border-l border-gray-100 transition-all ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 space-y-3 shrink-0 bg-gray-50">
            <div className="bg-white p-3 rounded-[1.2rem] shadow-sm space-y-3 border border-gray-100">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                  <input type="text" placeholder={appMode === 'ESTATE' ? t.search_estate : appMode === 'JOBS' ? t.search_jobs : t.search_services} className="w-full bg-[#F3F4F6] border-none rounded-xl pr-9 pl-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-[#a62626]/10 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="relative shrink-0">
                  <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 text-[#a62626]" size={12} />
                  <select 
                    value={selectedProvince} 
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="bg-[#F3F4F6] border-none rounded-xl pr-7 pl-2 py-2.5 text-[10px] font-black outline-none appearance-none"
                  >
                    {t.provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {appMode === 'ESTATE' && (
                <div className="flex bg-[#F3F4F6] p-1 rounded-xl">
                  <button onClick={() => setActiveDealFilter('ALL')} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeDealFilter === 'ALL' ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>{t.all}</button>
                  <button onClick={() => setActiveDealFilter(DealType.SALE)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeDealFilter === DealType.SALE ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>{t.sale}</button>
                  <button onClick={() => setActiveDealFilter(DealType.RENT)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeDealFilter === DealType.RENT ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>{t.rent}</button>
                  <button onClick={() => setActiveDealFilter(DealType.MORTGAGE)} className={`flex-1 py-1.5 rounded-lg text-[9px] font-black transition-all ${activeDealFilter === DealType.MORTGAGE ? 'bg-gray-800 text-white shadow-sm' : 'text-gray-400'}`}>{t.mortgage}</button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 pb-24 no-scrollbar space-y-3 pt-2">
            {filteredItems.map(item => renderCard(item))}
            {filteredItems.length === 0 && <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-100 mx-2"><p className="text-gray-400 font-bold text-xs">{t.no_results}</p></div>}
          </div>
        </div>

        {/* Map Content */}
        <div className={`flex-1 h-full relative ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <MapView items={filteredItems} selectedItem={selectedItem} onSelectItem={handleSelectItem} mode={appMode} visitedIds={visitedIds} />
        </div>

        {/* Bottom Navigation - Very compact for max screen usage */}
        <div className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t flex items-center justify-around z-[4000] px-1 shadow-[0_-2px_15px_rgba(0,0,0,0.05)] safe-area-bottom">
          <button onClick={() => { setAppMode('ESTATE'); if(viewMode==='map') setViewMode('list'); }} className={`flex flex-col items-center gap-0.5 flex-1 ${appMode === 'ESTATE' ? 'text-[#a62626]' : 'text-gray-300'}`}><Building2 size={18} /><span className="text-[8px] font-black">{t.estate}</span></button>
          <button onClick={() => { setAppMode('JOBS'); if(viewMode==='map') setViewMode('list'); }} className={`flex flex-col items-center gap-0.5 flex-1 ${appMode === 'JOBS' ? 'text-[#a62626]' : 'text-gray-300'}`}><Briefcase size={18} /><span className="text-[8px] font-black">{t.jobs}</span></button>
          <div className="relative -top-3"><button onClick={() => setShowAddModal(true)} className="w-11 h-11 bg-[#a62626] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all border-4 border-white"><Plus size={20} strokeWidth={3} /></button></div>
          <button onClick={() => { setAppMode('SERVICES'); if(viewMode==='map') setViewMode('list'); }} className={`flex flex-col items-center gap-0.5 flex-1 ${appMode === 'SERVICES' ? 'text-[#a62626]' : 'text-gray-300'}`}><Wrench size={18} /><span className="text-[8px] font-black">{t.services}</span></button>
          <button onClick={() => setShowAuthModal(true)} className="flex flex-col items-center gap-0.5 flex-1 text-gray-300"><User size={18} /><span className="text-[8px] font-black">{t.account}</span></button>
        </div>
      </main>

      {renderDetails()}
      {renderAddModal()}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          lang={lang} 
          onShowMyAds={() => {}} 
          onShowSaved={() => {}} 
          onAdminClick={() => { setShowAuthModal(false); setShowAdminLogin(true); }}
        />
      )}
      {showAdminLogin && (
        <AdminLogin 
          admins={ADMINS} 
          onLogin={() => { setShowAdminLogin(false); setIsAdminMode(true); }} 
          onCancel={() => setShowAdminLogin(false)} 
        />
      )}
    </div>
  );
}

export default App;
