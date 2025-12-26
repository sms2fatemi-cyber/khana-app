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
    dealType: DealType.SALE, bedrooms: '1', area: '', 
    address: '', city: 'کابل', description: '', 
    phoneNumber: '',
    location: { lat: 34.5553, lng: 69.2075 },
    images: [] as string[],
    isLocationSet: false
  });
  
  const [tempLoc, setTempLoc] = useState({ lat: 34.5553, lng: 69.2075 });
  const [flyToLoc, setFlyToLoc] = useState<{lat: number, lng: number} | null>(null);

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
        alert("خطا در دریافت موقعیت GPS. مطمئن شوید دسترسی مکان مجاز است.");
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
      case DealType.SALE: return t.total_price || 'قیمت کل';
      case DealType.RENT: return t.monthly_rent || 'کرایه ماهانه';
      case DealType.MORTGAGE: return t.mortgage_amount || 'مبلغ گروی';
      default: return t.price;
    }
  };

  if (isSuccess) return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center animate-slide-up shadow-2xl">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} /></div>
        <h2 className="text-2xl font-black mb-2">{t.new}</h2>
        <p className="text-sm text-gray-500 mb-8 font-bold leading-7">{t.success_msg}</p>
        <button onClick={() => window.location.reload()} className="w-full bg-[#a62626] text-white py-4 rounded-2xl font-black text-lg">متوجه شدم</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-0 md:p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[92vh] rounded-none md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        
        {view === 'map' && (
          <div className="absolute inset-0 z-[110] flex flex-col bg-white animate-in fade-in duration-300">
            <div className="h-16 flex items-center px-6 border-b shrink-0 bg-white shadow-sm">
              <button onClick={() => setView('form')} className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-all"><ChevronRight size={32} /></button>
              <h2 className="font-black text-lg mr-2">{t.select_location}</h2>
            </div>
            <div className="flex-1 relative bg-gray-100">
              <MapContainer center={[tempLoc.lat, tempLoc.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEventsHandler onMove={(lat, lng) => setTempLoc({ lat, lng })} />
                {flyToLoc && <MapFlyTo center={flyToLoc} />}
              </MapContainer>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none pb-4">
                 <div className="w-10 h-10 bg-[#a62626] rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce"><div className="w-2 h-2 bg-white rounded-full"></div></div>
              </div>

              <button 
                onClick={handleLocateMe}
                className="absolute bottom-32 right-6 z-[1000] w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-[#a62626] active:scale-90 transition-all border border-gray-100"
              >
                {isLocating ? <Loader2 size={24} className="animate-spin" /> : <Crosshair size={28} />}
              </button>

              <div className="absolute bottom-10 left-6 right-6 z-[1000]">
                <button onClick={() => { setFormData(prev => ({ ...prev, location: tempLoc, isLocationSet: true })); setView('form'); }} className="w-full bg-[#a62626] text-white py-4.5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">تایید موقعیت</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-6 border-b shrink-0">
          <h2 className="font-black text-xl text-gray-800">{t.add_post}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={28} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
          <form id="prop-form" onSubmit={handleSubmit} className="space-y-7">
            <div className="space-y-3">
              <div className="flex justify-between items-center mr-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.upload_photo} (تا ۱۰ قطعه)</label>
                <span className="text-[10px] font-black text-gray-400">{formData.images.length} / 10</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {formData.images.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden relative border border-gray-100 group shadow-sm">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                  </div>
                ))}
                {formData.images.length < 10 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:border-[#a62626] hover:text-[#a62626] transition-all">
                    <Camera size={28} /><span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{t.upload_photo}</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleFileChange} />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">{t.type}</label>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                {Object.values(DealType).map(type => (
                  <button key={type} type="button" onClick={() => handleInputChange('dealType', type)} className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${formData.dealType === type ? 'bg-white text-[#a62626] shadow-sm' : 'text-gray-400'}`}>{type}</button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setView('map')} className={`w-full border-2 border-dashed rounded-2xl p-7 flex flex-col items-center gap-3 transition-all group ${formData.isLocationSet ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400 hover:border-[#a62626] hover:text-[#a62626]'}`}>
              <MapPin size={36} /><span className="block font-black text-sm">{formData.isLocationSet ? t.location : t.select_location}</span>
            </button>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="relative">
                  <select value={formData.type} onChange={e => handleInputChange('type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black outline-none appearance-none">
                    {Object.values(PropertyType).map((type) => (<option key={type} value={type}>{type}</option>))}
                  </select>
                  <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
                <input type="number" value={formData.area} onChange={e => handleInputChange('area', e.target.value)} placeholder={t.area} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black outline-none" required />
              </div>
              <input type="number" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} placeholder={getPricePlaceholder()} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black outline-none" required />
              {formData.dealType === DealType.RENT && (
                <input type="number" value={formData.deposit} onChange={e => handleInputChange('deposit', e.target.value)} placeholder={t.deposit || 'پیش‌پرداخت / تضمین'} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black outline-none" />
              )}
            </div>

            <input type="text" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder={t.title} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-black outline-none" required />
            <div className="relative">
              <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input type="tel" value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value)} placeholder="07XXXXXXXX" className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-12 pl-4 py-4 font-black outline-none text-left dir-ltr" required />
            </div>
            <textarea rows={4} value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder={t.description} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none resize-none"></textarea>
          </form>
        </div>

        <div className="p-6 border-t bg-white flex gap-4 shrink-0 shadow-inner">
          <button form="prop-form" type="submit" disabled={isSubmitting} className="flex-[2] bg-[#a62626] text-white py-4.5 rounded-2xl font-black text-lg shadow-xl">
            {isSubmitting ? <Loader2 size={24} className="animate-spin mx-auto" /> : t.submit}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 py-4.5 rounded-2xl font-black text-base">{t.cancel}</button>
        </div>
      </div>
    </div>
  );
};
export default AddPropertyModal;