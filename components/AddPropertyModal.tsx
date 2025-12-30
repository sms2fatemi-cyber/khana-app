
import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Check, ChevronRight, Loader2, Smartphone, Camera, Trash2 } from 'lucide-react';
import { PropertyType, DealType } from '../types';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { supabase, TABLES, uploadMultipleImages, isSupabaseReady } from '../services/supabaseClient';

interface AddPropertyModalProps {
  onClose: () => void;
  t: any;
}

const toEnglishDigits = (str: string) => {
  if (!str) return '';
  return str.toString().replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString());
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(map.getContainer());
    const timer = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [map]);
  return null;
};

const MapEventsHandler = ({ onMove }: { onMove: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    const handleMove = () => {
      const center = map.getCenter();
      onMove(center.lat, center.lng);
    };
    map.on('moveend', handleMove);
    return () => { map.off('moveend', handleMove); };
  }, [map, onMove]);
  return null;
};

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, t }) => {
  const [view, setView] = useState<'form' | 'map'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  
  const [formData, setFormData] = useState({ 
    title: '', price: '', deposit: '', type: PropertyType.APARTMENT, 
    dealType: DealType.SALE, bedrooms: '1', hasStorage: false, area: '', 
    address: '', city: t.provinces[1] || 'کابل', description: '', 
    phoneNumber: '',
    location: { lat: 34.5553, lng: 69.2075 },
    previewImages: [] as string[],
    isLocationSet: false
  });
  
  const [tempLoc, setTempLoc] = useState({ lat: 34.5553, lng: 69.2075 });

  const isResidential = [PropertyType.APARTMENT, PropertyType.HOUSE, PropertyType.HOME].includes(formData.type);

  const handleInputChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const remainingSlots = 10 - formData.previewImages.length;
      const filesArr = Array.from(files).slice(0, remainingSlots) as File[];
      setFilesToUpload(prev => [...prev, ...filesArr].slice(0, 10));

      filesArr.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setFormData(prev => ({ ...prev, previewImages: [...prev.previewImages, event.target?.result as string].slice(0, 10) }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, previewImages: prev.previewImages.filter((_, i) => i !== index) }));
    setFilesToUpload(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanPrice = toEnglishDigits(formData.price);
    const cleanPhone = toEnglishDigits(formData.phoneNumber);
    const cleanArea = toEnglishDigits(formData.area);

    if (!formData.title) return alert("لطفاً عنوان آگهی را وارد کنید.");
    if (!cleanPrice) return alert("لطفاً قیمت را وارد کنید.");
    if (!cleanPhone || cleanPhone.length < 9) return alert("شماره موبایل وارد شده صحیح نیست.");
    if (!formData.address) return alert("لطفاً آدرس دقیق را وارد کنید.");

    setIsSubmitting(true);
    try {
      let finalUrls: string[] = [];
      if (filesToUpload.length > 0) {
        finalUrls = await uploadMultipleImages(filesToUpload);
      } else {
        // اگر عکسی انتخاب نشده، یک عکس تصادفی با کیفیت بالا استفاده کن
        finalUrls = [`https://picsum.photos/seed/${Date.now()}/800/600`];
      }

      const payload = {
        title: formData.title,
        price: parseFloat(cleanPrice) || 0,
        currency: 'AFN',
        location: formData.isLocationSet ? formData.location : { lat: 34.5553, lng: 69.2075 },
        address: formData.address,
        city: formData.city,
        images: finalUrls,
        bedrooms: parseInt(formData.bedrooms),
        area: parseFloat(cleanArea) || 0,
        type: formData.type,
        deal_type: formData.dealType,
        description: formData.description,
        phone_number: cleanPhone,
        status: 'PENDING', // صریحاً روی در انتظار تایید قرار می‌گیرد
        owner_id: localStorage.getItem('user_phone') || 'guest'
      };

      if (isSupabaseReady()) {
        const { error } = await supabase.from(TABLES.PROPERTIES).insert([payload]);
        if (error) throw error;
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Demo Mode Submission:", payload);
      }
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Submit Error:", err);
      alert("خطا در ثبت آگهی: " + (err.message || "لطفاً دوباره تلاش کنید."));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 text-center animate-slide-up shadow-2xl">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Check size={40} />
        </div>
        <h2 className="text-2xl font-black mb-2">با موفقیت ثبت شد</h2>
        <p className="text-sm text-gray-500 mb-8 font-bold leading-7">آگهی شما ثبت شد و پس از بازبینی ادمین در لیست عمومی نمایش داده می‌شود.</p>
        <button onClick={() => onClose()} className="w-full bg-[#a62626] text-white py-4 rounded-xl font-black text-lg shadow-xl active:scale-95 transition-all">متوجه شدم</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-0 md:p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl h-full md:h-auto md:max-h-[92vh] rounded-none md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        
        {view === 'map' && (
          <div className="absolute inset-0 z-[110] flex flex-col bg-white animate-in fade-in slide-in-from-left duration-300">
            <div className="h-16 flex items-center px-6 border-b shrink-0 bg-white shadow-sm">
              <button onClick={() => setView('form')} className="p-2 -mr-3 active:scale-75 transition-transform"><ChevronRight size={32} /></button>
              <h2 className="font-black text-lg mr-2">{t.select_location}</h2>
            </div>
            <div className="flex-1 relative bg-gray-100">
              <MapContainer center={[tempLoc.lat, tempLoc.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapResizer />
                <MapEventsHandler onMove={(lat, lng) => setTempLoc({ lat, lng })} />
              </MapContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none pb-4">
                 <div className="w-10 h-10 bg-[#a62626] rounded-full border-4 border-white shadow-2xl flex items-center justify-center animate-bounce">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                 </div>
              </div>
              <div className="absolute bottom-8 left-6 right-6 z-[1000]">
                <button onClick={() => { setFormData(prev => ({ ...prev, location: tempLoc, isLocationSet: true })); setView('form'); }} className="w-full bg-[#a62626] text-white py-4.5 rounded-2xl font-black text-xl shadow-2xl active:scale-95 transition-all">تایید موقعیت ملک</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-6 border-b shrink-0 bg-white">
          <h2 className="font-black text-2xl text-gray-800">{t.add_post}</h2>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all active:scale-75"><X size={32} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-24 space-y-8">
          <form id="prop-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t.upload_photo}</label>
                <span className="text-[11px] font-black text-gray-400">{formData.previewImages.length} / 10</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
                {formData.previewImages.map((img, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden relative border-2 border-gray-100 shadow-sm group">
                    <img src={img} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)} className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                  </div>
                ))}
                {formData.previewImages.length < 10 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:border-[#a62626] hover:bg-red-50 transition-all active:scale-95">
                    <Camera size={32} />
                    <span className="text-[10px] font-black mt-1 uppercase">افزودن</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleFileChange} />
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase ml-2 block">نوع معامله</label>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl shadow-inner border border-gray-200/50">
                {Object.values(DealType).map(type => (
                  <button key={type} type="button" onClick={() => handleInputChange('dealType', type)} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${formData.dealType === type ? 'bg-white text-[#a62626] shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>{type}</button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => setView('map')} className={`w-full border-2 border-dashed rounded-[2rem] p-8 flex flex-col items-center gap-3 transition-all shadow-sm ${formData.isLocationSet ? 'border-green-500 bg-green-50 text-green-600' : 'border-gray-200 text-gray-400 hover:bg-gray-50 hover:border-[#a62626]'}`}>
              <MapPin size={36} />
              <div className="text-center">
                 <span className="block font-black text-base">{formData.isLocationSet ? 'موقعیت دقیق انتخاب شد' : 'تعیین آدرس روی نقشه'}</span>
                 {!formData.isLocationSet && <span className="text-[10px] font-bold opacity-60">برای تایید آدرس حتما روی نقشه کلیک کنید</span>}
              </div>
            </button>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.type} onChange={e => handleInputChange('type', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4.5 text-sm font-black outline-none focus:border-[#a62626] transition-all shadow-sm">
                  {Object.values(PropertyType).map((type) => (<option key={type} value={type}>{type}</option>))}
                </select>
                <input type="text" inputMode="numeric" value={formData.area} onChange={e => handleInputChange('area', e.target.value)} placeholder={t.area} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4.5 text-sm font-black outline-none focus:border-[#a62626] transition-all shadow-sm" required />
              </div>

              {isResidential && (
                <div className="grid grid-cols-2 gap-4">
                  <select value={formData.bedrooms} onChange={e => handleInputChange('bedrooms', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4.5 text-sm font-black outline-none focus:border-[#a62626] shadow-sm">
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {t.bedrooms}</option>)}
                    <option value="7">+7 {t.bedrooms}</option>
                  </select>
                  <select value={formData.hasStorage ? '1' : '0'} onChange={e => handleInputChange('hasStorage', e.target.value === '1')} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4.5 text-sm font-black outline-none focus:border-[#a62626] shadow-sm">
                    <option value="1">{t.has_storage}</option>
                    <option value="0">{t.no_storage}</option>
                  </select>
                </div>
              )}

              <div className="relative">
                <input type="text" inputMode="numeric" value={formData.price} onChange={e => handleInputChange('price', e.target.value)} placeholder="قیمت کل (افغانی)" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4.5 text-base font-black outline-none focus:border-[#a62626] shadow-sm" required />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">AFN</span>
              </div>
              
              <div className="relative">
                <Smartphone className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input type="tel" value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value)} placeholder="شماره موبایل تماس" className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-14 pl-5 py-4.5 text-base font-black outline-none text-left dir-ltr focus:border-[#a62626] shadow-sm" required />
              </div>

              <input type="text" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder={t.title} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4.5 text-sm font-black outline-none focus:border-[#a62626] shadow-sm" required />
              <input type="text" value={formData.address} onChange={e => handleInputChange('address', e.target.value)} placeholder={t.address} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4.5 text-sm font-black outline-none focus:border-[#a62626] shadow-sm" required />
              <textarea rows={4} value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder={t.description} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4.5 text-sm font-bold outline-none focus:border-[#a62626] shadow-sm resize-none"></textarea>
            </div>
          </form>
        </div>

        <div className="p-6 border-t bg-white flex gap-4 shrink-0 shadow-2xl safe-area-bottom">
          <button form="prop-form" type="submit" disabled={isSubmitting} className="flex-[2] bg-[#a62626] text-white py-4.5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all disabled:bg-gray-300 flex items-center justify-center">
            {isSubmitting ? <Loader2 size={28} className="animate-spin" /> : 'ثبت آگهی'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 py-4.5 rounded-2xl font-black text-sm active:scale-95">انصراف</button>
        </div>
      </div>
    </div>
  );
};
export default AddPropertyModal;
