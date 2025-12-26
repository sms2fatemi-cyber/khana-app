
import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, MapPin, Check, ChevronRight, Loader2, Smartphone, Crosshair } from 'lucide-react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { PropertyType, DealType } from '../types';
import { supabase, TABLES, uploadMultipleImages } from '../services/supabaseClient';

interface AddPropertyModalProps {
  onClose: () => void;
  t: any;
}

// ناظر دقیق بر اندازه کانتینر برای حل مشکل نقشه خاکستری در مودال
const MapInvalidator = () => {
  const map = useMap();
  const container = map.getContainer();

  useEffect(() => {
    if (!map || !container) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);
    
    // چندین بار تلاش برای لایه‌های نقشه
    const timers = [100, 300, 600, 1200].map(ms => 
      setTimeout(() => map.invalidateSize(), ms)
    );

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [map, container]);

  return null;
};

const MapController = ({ 
  onLocationFound, 
  forceCenter 
}: { 
  onLocationFound: (lat: number, lng: number) => void,
  forceCenter: [number, number] | null
}) => {
  const map = useMap();

  useEffect(() => {
    if (forceCenter) {
      map.flyTo(forceCenter, 16, { animate: true });
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [forceCenter, map]);

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onLocationFound(center.lat, center.lng);
    }
  });

  return null;
};

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, t }) => {
  const [view, setView] = useState<'form' | 'map'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({ 
    title: '', price: '', type: PropertyType.APARTMENT, 
    dealType: DealType.SALE, bedrooms: '', area: '', 
    address: '', city: 'کابل', description: '', 
    phoneNumber: '',
    location: null as {lat: number, lng: number} | null 
  });
  
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [tempLocation, setTempLocation] = useState({ lat: 34.5553, lng: 69.2075 });
  const [forceFly, setForceFly] = useState<[number, number] | null>(null);

  const handleInputChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));
  
  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLocating(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setTempLocation({ lat, lng });
          setForceFly([lat, lng]);
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          alert("لطفاً GPS گوشی خود را روشن کنید.");
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
      setPreviews(prev => [...prev, ...files.map((file: File) => URL.createObjectURL(file))]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phoneNumber) { alert("لطفاً شماره تماس را وارد کنید."); return; }
    setIsSubmitting(true);
    try {
      let finalImageUrls = selectedFiles.length ? await uploadMultipleImages(selectedFiles) : [`https://picsum.photos/seed/${Date.now()}/800/600`];
      const { error } = await supabase.from(TABLES.PROPERTIES).insert([{
        title: formData.title,
        price: parseFloat(formData.price) || 0,
        currency: 'AFN',
        deal_type: formData.dealType,
        property_type: formData.type,
        bedrooms: parseInt(formData.bedrooms) || 0,
        area: parseFloat(formData.area) || 0,
        city: formData.city,
        address: formData.address,
        description: formData.description,
        phone_number: formData.phoneNumber,
        location: formData.location || tempLocation,
        images: finalImageUrls,
        status: 'PENDING',
        owner_id: 'user_123'
      }]);
      if (error) throw error;
      setIsSuccess(true);
    } catch (err: any) { 
      alert("خطا در ثبت آگهی.");
    } finally { setIsSubmitting(false); }
  };

  if (isSuccess) return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center shadow-2xl animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} /></div>
        <h2 className="text-2xl font-black mb-2">ثبت شد!</h2>
        <p className="text-sm text-gray-500 mb-8 font-bold leading-7">آگهی پس از تایید مدیریت نمایش داده می‌شود.</p>
        <button onClick={() => window.location.reload()} className="w-full bg-[#a62626] text-white py-4 rounded-xl font-black text-lg shadow-xl">متوجه شدم</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 md:backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-md md:rounded-[3rem] flex flex-col overflow-hidden relative shadow-2xl" onClick={e => e.stopPropagation()}>
        
        {view === 'map' && (
          <div className="absolute inset-0 z-[500] flex flex-col bg-white">
            <div className="h-16 flex items-center px-6 border-b shrink-0 bg-white shadow-sm">
              <button onClick={() => setView('form')} className="p-2 -mr-2"><ChevronRight size={32} /></button>
              <h2 className="font-black text-lg mr-2">انتخاب مکان روی نقشه</h2>
            </div>
            <div className="flex-1 relative bg-gray-100">
              <MapContainer 
                key="add-prop-map-final"
                center={[tempLocation.lat, tempLocation.lng]} 
                zoom={14} 
                style={{ height: '100%', width: '100%' }} 
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapInvalidator />
                <MapController onLocationFound={(lat, lng) => setTempLocation({ lat, lng })} forceCenter={forceFly} />
              </MapContainer>
              
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none pb-4">
                <MapPin size={48} className="text-[#a62626] drop-shadow-2xl" />
              </div>
              
              {/* دکمه مکان‌یابی - سمت راست، کاملاً شفاف */}
              <button 
                onClick={handleLocateMe}
                className="absolute bottom-40 right-6 w-14 h-14 text-[#a62626] z-[1500] flex items-center justify-center active:scale-90 transition-all filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
                style={{ background: 'transparent', border: 'none' }}
              >
                {isLocating ? <Loader2 size={38} className="animate-spin" /> : <Crosshair size={38} />}
              </button>

              <div className="absolute bottom-8 left-8 right-8 z-[1500]">
                <button onClick={() => { handleInputChange('location', tempLocation); setView('form'); }} className="w-full bg-[#a62626] text-white py-4.5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">تایید مکان</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-5 border-b shrink-0 bg-white">
          <h2 className="font-black text-xl text-gray-800">ثبت آگهی املاک</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={32} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
          <form id="prop-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              {Object.values(DealType).map(type => (
                <button 
                  key={type} 
                  type="button" 
                  onClick={() => handleInputChange('dealType', type)} 
                  className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.dealType === type ? 'bg-[#a62626] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                >
                  {type === DealType.SALE ? 'فروشی' : type === DealType.RENT ? 'کرایی' : 'گروی'}
                </button>
              ))}
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              {previews.map((img, i) => (<div key={i} className="aspect-square rounded-2xl border overflow-hidden shadow-sm"><img src={img} className="w-full h-full object-cover" /></div>))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:border-[#a62626] transition-all">
                <Camera size={32} /> <span className="text-[10px] mt-1 font-black">عکس</span>
              </button>
              <input type="file" ref={fileInputRef} hidden multiple onChange={handleFileChange} />
            </div>

            <div className="space-y-4">
              <input type="text" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="عنوان آگهی" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base font-bold outline-none focus:ring-2 focus:ring-[#a62626]/20 transition-all" required />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} placeholder="قیمت (افغانی)" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base font-bold outline-none" required />
                <input type="number" value={formData.area} onChange={e => handleInputChange('area', e.target.value)} placeholder="مساحت (متر)" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base font-bold outline-none" required />
              </div>

              <div className="relative">
                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input type="tel" value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value)} placeholder="شماره تماس" className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-12 pl-5 py-4 text-base font-bold outline-none text-left dir-ltr" required />
              </div>

              <button type="button" onClick={() => setView('map')} className={`w-full border-2 border-dashed rounded-2xl p-5 flex items-center justify-center gap-2 transition-all font-black text-sm ${formData.location ? 'text-green-600 bg-green-50 border-green-200 shadow-inner' : 'text-gray-400 border-gray-200 hover:border-[#a62626]'}`}>
                <MapPin size={28} /> {formData.location ? 'مکان انتخاب شد' : 'تعیین مکان روی نقشه'}
              </button>

              <select value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none appearance-none">
                {t.provinces.map((p: string) => <option key={p} value={p}>{p}</option>)}
              </select>

              <textarea rows={3} value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="توضیحات..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base font-bold outline-none resize-none transition-all"></textarea>
            </div>
          </form>
        </div>

        <div className="p-5 border-t bg-white flex gap-4 shrink-0 shadow-inner z-20">
          <button form="prop-form" type="submit" disabled={isSubmitting} className="flex-[2] bg-[#a62626] text-white py-4 rounded-2xl font-black text-lg shadow-xl disabled:bg-red-300 transition-all flex items-center justify-center">
            {isSubmitting ? <Loader2 size={28} className="animate-spin" /> : 'ثبت آگهی'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black text-lg">انصراف</button>
        </div>
      </div>
    </div>
  );
};
export default AddPropertyModal;
