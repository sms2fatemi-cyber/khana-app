import { useState, useMemo, useEffect } from 'react';
import { Search, User, Briefcase, Building2, Wrench, Plus, List, Globe, Map as MapIcon } from 'lucide-react';
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
import { PROPERTIES, JOBS, SERVICES } from './services/mockData';
import { Property, Job, Service, AppMode, Language, DealType } from './types';
import { translations } from './services/translations';

function App() {
  const lang = (localStorage.getItem('app_lang') as Language) || 'dari';
  const t = translations[lang];

  const [appMode, setAppMode] = useState<AppMode>('ESTATE');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('list');
  const [selectedItem, setSelectedItem] = useState<Property | Job | Service | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeDealFilter, setActiveDealFilter] = useState<'ALL' | DealType>('ALL');
  const [visitedIds, setVisitedIds] = useState<Set<string>>(new Set());

  // Clean state when mode changes
  useEffect(() => {
    setSelectedItem(null);
    setIsDetailOpen(false);
    setSearchTerm('');
  }, [appMode]);

  const filteredItems = useMemo(() => {
    let base = appMode === 'ESTATE' ? PROPERTIES : appMode === 'JOBS' ? JOBS : SERVICES;
    return base.filter(item => {
      const titleMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      if (appMode === 'ESTATE') {
        const p = item as Property;
        const dealMatch = activeDealFilter === 'ALL' || p.dealType === activeDealFilter;
        return titleMatch && dealMatch;
      }
      return titleMatch;
    });
  }, [appMode, searchTerm, activeDealFilter]);

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
      {/* Header */}
      <header className="h-[75px] bg-white border-b flex items-center justify-between px-6 z-[3000] shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setShowAddModal(true)} className="bg-[#a62626] text-white px-7 py-2.5 rounded-xl font-black text-sm shadow-lg shadow-red-900/20 active:scale-95 transition-all">{t.add_post}</button>
          <button onClick={() => setShowAuthModal(true)} className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"><User size={24} /></button>
          <button className="flex items-center gap-2 text-gray-500 font-bold text-sm px-3 py-2 hover:bg-gray-100 rounded-xl transition-all"><Globe size={18} /><span>دری</span></button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block"><h1 className="font-black text-[#a62626] text-xl leading-none">خانه</h1><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Afghanistan</span></div>
          <div className="w-12 h-12 bg-[#a62626] rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/30"><Building2 size={26} className="text-white" /></div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* List Content */}
        <div className={`w-full md:w-[420px] lg:w-[460px] h-full flex flex-col bg-white z-20 shrink-0 border-l border-gray-100 transition-all ${viewMode === 'map' ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-5 space-y-4 shrink-0 bg-gray-50">
            <div className="bg-white p-5 rounded-[2.2rem] shadow-sm space-y-4 border border-gray-100">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input type="text" placeholder={appMode === 'ESTATE' ? t.search_estate : appMode === 'JOBS' ? t.search_jobs : t.search_services} className="w-full bg-[#F3F4F6] border-none rounded-2xl pr-12 pl-4 py-3.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#a62626]/10 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {appMode === 'ESTATE' && (
                <div className="flex bg-[#F3F4F6] p-1.5 rounded-2xl">
                  <button onClick={() => setActiveDealFilter('ALL')} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeDealFilter === 'ALL' ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400'}`}>{t.all}</button>
                  <button onClick={() => setActiveDealFilter(DealType.SALE)} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeDealFilter === DealType.SALE ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400'}`}>{t.sale}</button>
                  <button onClick={() => setActiveDealFilter(DealType.RENT)} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeDealFilter === DealType.RENT ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400'}`}>{t.rent}</button>
                  <button onClick={() => setActiveDealFilter(DealType.MORTGAGE)} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${activeDealFilter === DealType.MORTGAGE ? 'bg-gray-800 text-white shadow-md' : 'text-gray-400'}`}>{t.mortgage}</button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto px-5 pb-32 no-scrollbar space-y-4 pt-4">
            {filteredItems.map(item => renderCard(item))}
            {filteredItems.length === 0 && <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 mx-2"><p className="text-gray-400 font-bold">{t.no_results}</p></div>}
          </div>
        </div>

        {/* Map Content */}
        <div className={`flex-1 h-full relative ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <MapView 
            items={filteredItems} 
            selectedItem={selectedItem} 
            onSelectItem={handleSelectItem} 
            mode={appMode} 
            visitedIds={visitedIds} 
          />
        </div>

        {/* Floating Toggle Button for Mobile - Explicitly centered and clickable */}
        <div className="md:hidden fixed bottom-28 left-0 right-0 flex justify-center z-[5000] pointer-events-none">
          <button 
            onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
            className="bg-gray-900 text-white px-8 py-4 rounded-full font-black text-sm flex items-center gap-3 shadow-2xl active:scale-95 transition-all pointer-events-auto border-2 border-white/20"
          >
            {viewMode === 'list' ? (
              <><MapIcon size={22} /> <span>{t.map}</span></>
            ) : (
              <><List size={22} /> <span>{t.list}</span></>
            )}
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-[85px] bg-white border-t flex items-center justify-around z-[4000] px-4 shadow-[0_-5px_30px_rgba(0,0,0,0.08)]">
          <button onClick={() => { setAppMode('ESTATE'); if(viewMode==='map') setViewMode('list'); }} className={`flex flex-col items-center gap-1.5 flex-1 ${appMode === 'ESTATE' ? 'text-[#a62626]' : 'text-gray-300'}`}><Building2 size={26} /><span className="text-[11px] font-black">{t.estate}</span></button>
          <button onClick={() => { setAppMode('JOBS'); if(viewMode==='map') setViewMode('list'); }} className={`flex flex-col items-center gap-1.5 flex-1 ${appMode === 'JOBS' ? 'text-[#a62626]' : 'text-gray-300'}`}><Briefcase size={26} /><span className="text-[11px] font-black">{t.jobs}</span></button>
          <div className="relative -top-7"><button onClick={() => setShowAddModal(true)} className="w-16 h-16 bg-[#a62626] text-white rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-red-900/40 active:scale-90 transition-all border-4 border-white"><Plus size={32} strokeWidth={3} /></button></div>
          <button onClick={() => { setAppMode('SERVICES'); if(viewMode==='map') setViewMode('list'); }} className={`flex flex-col items-center gap-1.5 flex-1 ${appMode === 'SERVICES' ? 'text-[#a62626]' : 'text-gray-300'}`}><Wrench size={26} /><span className="text-[11px] font-black">{t.services}</span></button>
          <button onClick={() => setShowAuthModal(true)} className="flex flex-col items-center gap-1.5 flex-1 text-gray-300"><User size={26} /><span className="text-[11px] font-black">{t.account}</span></button>
        </div>
      </main>

      {renderDetails()}
      {renderAddModal()}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} lang={lang} onShowMyAds={() => {}} onShowSaved={() => {}} />}
    </div>
  );
}

export default App;