
import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Check, ChevronRight, Loader2, Smartphone, Camera, Trash2, Crosshair, ChevronDown } from 'lucide-react';
import { PropertyType, DealType } from '../types';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

interface AddPropertyModalProps {
  onClose: () => void;
  t: any;
}

const MapEventsHandler = ({ onMove }: { onMove: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timers = [100, 300, 600].map(ms => setTimeout(() => map.invalidateSize(), ms));
    const handleMove = () => {
      const center = map.getCenter();
      onMove(center.lat, center.lng);
    };
    map.on('moveend', handleMove);
    return () => { 
      timers.forEach(clearTimeout);
      map.off('moveend', handleMove); 
    };
  }, [map, onMove]);
  return null;
};

const MapFlyTo = ({ center }: { center: {lat: number, lng: number} }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 16, { animate: true });
    }
  }, [center, map]);
  return null;
};

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, t }) => {
  const [view, setView] = useState<'form' | 'map'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({ 
    title: '', price: '', deposit: '', type: PropertyType.APARTMENT, 
    dealType: DealType.SALE, bedrooms: '1', hasStorage: false, area: '', 
    address: '', city: 'کابل', description: '', 
    phoneNumber: '',
    location: { lat: 34.5553, lng: 69.2075 },
    images: [] as string[],
    isLocationSet: false
  });
  
  const [tempLoc, setTempLoc] = useState({ lat: 34.5553, lng: 69.2075 });
  const [flyToLoc, setFlyToLoc] = useState<{lat: number, lng: number} | null>(null);

  const isResidential = [PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.HOME].includes(formData.type);

  const handleInputChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setTempLoc(newLoc);
        setFlyToLoc(newLoc);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert("خطا در دریافت موقعیت GPS.");
      },
      { enableHighAccuracy: true }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const remainingSlots = 10 - formData.images.length;
      const filesToProcess = Array.from(files).slice(0, Math.max(0, remainingSlots)) as File[];
      const readers = filesToProcess.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readers).then(newImages => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages].slice(0, 10)
        }));
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const getPricePlaceholder = () => {
    switch (formData.dealType) {
      case DealType.SALE: return t.total_price;
      case DealType.RENT: return t.monthly_rent;
      case DealType.MORTGAGE: return t.mortgage_amount;
      default: return t.price;
    }
  };

  if (isSuccess) return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 text-center animate-slide-up shadow-2xl">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={32} /></div>
        <h2 className="text-xl font-black mb-2">{t.new}</h2>
        <p className="text-sm text-gray-500 mb-6 font-bold leading-7">{t.success_msg}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-[#a62626] text-white py-3.5 rounded-xl font-black text-base">متوجه شدم</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[92vh] rounded-none md:rounded-[2rem] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        
        {view === 'map' && (
          <div className="absolute inset-0 z-[110] flex flex-col bg-white animate-in fade-in duration-300">
            <div className="h-14 flex items-center px-4 border-b shrink-0 bg-white shadow-sm">
              <button onClick={() => setView('form')} className="p-2"><ChevronRight size={28} /></button>
              <h2 className="font-black text-base mr-2">{t.select_location}</h2>
            </div>
            <div className="flex-1 relative bg-gray-100">
              <MapContainer center={[tempLoc.lat, tempLoc.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEventsHandler onMove={(lat, lng) => setTempLoc({ lat, lng })} />
                {flyToLoc && <MapFlyTo center={flyToLoc} />}
              </MapContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none pb-4">
                 <div className="w-8 h-8 bg-[#a62626] rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce"><div className="w-1.5 h-1.5 bg-white rounded-full"></div></div>
              </div>
              <button onClick={handleLocateMe} className="absolute bottom-24 right-4 z-[1000] w-12 h-12 bg-white rounded-xl shadow-xl flex items-center justify-center text-[#a62626] active:scale-90 border border-gray-100">
                {isLocating ? <Loader2 size={20} className="animate-spin" /> : <Crosshair size={24} />}
              </button>
              <div className="absolute bottom-6 left-4 right-4 z-[1000]">
                <button onClick={() => { setFormData(prev => ({ ...prev, location: tempLoc, isLocationSet: true })); setView('form'); }} className="w-full bg-[#a62626] text-white py-4 rounded-xl font-black text-base shadow-lg">تایید موقعیت</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="font-black text-lg text-gray-800">{t.add_post}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 no-scrollbar pb-24">
          <form id="prop-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center mr-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.upload_photo}</label>
                <span className="text-[10px] font-black text-gray-400">{formData.images.length} / 10</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {formData.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden relative border shadow-sm">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-md"><Trash2 size={12} /></button>
                  </div>
                ))}
                {formData.images.length < 10 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:border-[#a62626]">
                    <Camera size={24} /><span className="text-[8px] font-black mt-1 uppercase">{t.upload_photo}</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleFileChange} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase mr-1">{t.type}</label>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                {Object.values(DealType).map(type => (
                  <button key={type} type="button" onClick={() => handleInputChange('dealType', type)} className={`flex-1 py-2 rounded-lg text-xs font-black transition-all ${formData.dealType === type ? 'bg-white text-[#a62626] shadow-sm' : 'text-gray-400'}`}>{type}</button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setView('map')} className={`w-full border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 transition-all ${formData.isLocationSet ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400'}`}>
              <MapPin size={24} /><span className="block font-black text-xs">{formData.isLocationSet ? t.location : t.select_location}</span>
            </button>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select value={formData.type} onChange={e => handleInputChange('type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none appearance-none">
                    {Object.values(PropertyType).map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                  <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
                <input type="number" value={formData.area} onChange={e => handleInputChange('area', e.target.value)} placeholder={t.area} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none" required />
              </div>

              {isResidential && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="relative">
                    <label className="absolute -top-2 right-3 px-1 bg-white text-[9px] font-black text-gray-400">{t.bedrooms}</label>
                    <select value={formData.bedrooms} onChange={e => handleInputChange('bedrooms', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none appearance-none">
                      {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {t.bedrooms}</option>)}
                      <option value="7">+7 {t.bedrooms}</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                  <div className="relative">
                    <label className="absolute -top-2 right-3 px-1 bg-white text-[9px] font-black text-gray-400">{t.storage}</label>
                    <select value={formData.hasStorage ? '1' : '0'} onChange={e => handleInputChange('hasStorage', e.target.value === '1')} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none appearance-none">
                      <option value="1">{t.has_storage}</option>
                      <option value="0">{t.no_storage}</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                  </div>
                </div>
              )}

              <input type="number" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} placeholder={getPricePlaceholder()} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none" required />
              {formData.dealType === DealType.RENT && (
                <input type="number" value={formData.deposit} onChange={e => handleInputChange('deposit', e.target.value)} placeholder={t.deposit} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none" />
              )}
            </div>

            <input type="text" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder={t.title} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none" required />
            <input type="text" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} placeholder={t.address} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-black outline-none" required />
            
            <div className="relative">
              <Smartphone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="tel" value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value)} placeholder="07XXXXXXXX" className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3.5 text-sm font-black outline-none text-left dir-ltr" required />
            </div>
            <textarea rows={3} value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder={t.description} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none resize-none"></textarea>
          </form>
        </div>

        <div className="p-4 border-t bg-white flex gap-3 shrink-0 shadow-inner safe-area-bottom">
          <button form="prop-form" type="submit" disabled={isSubmitting} className="flex-[2] bg-[#a62626] text-white py-3.5 rounded-xl font-black text-base shadow-lg">
            {isSubmitting ? <Loader2 size={20} className="animate-spin mx-auto" /> : t.submit}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 py-3.5 rounded-xl font-black text-sm">{t.cancel}</button>
        </div>
      </div>
    </div>
  );
};
export default AddPropertyModal;