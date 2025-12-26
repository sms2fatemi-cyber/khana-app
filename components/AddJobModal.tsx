import React, { useState, useEffect, useRef } from 'react';
import { X, Check, MapPin, ChevronRight, Crosshair, Loader2, Camera, Trash2, Smartphone } from 'lucide-react';
import { JobType } from '../types';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { supabase, TABLES, uploadImage } from '../services/supabaseClient';

interface AddJobModalProps {
  onClose: () => void;
  t: any;
}

const MapController = ({ center }: { center: {lat: number, lng: number} }) => {
  const map = useMap();
  useEffect(() => {
    // Sequential resizes to fix the "Gray Map" issue
    map.invalidateSize();
    const timers = [100, 400, 800].map(ms => setTimeout(() => map.invalidateSize(), ms));
    
    if (center && center.lat !== 0) {
      map.flyTo([center.lat, center.lng], 16, { animate: true, duration: 1.5 });
    }
    return () => timers.forEach(clearTimeout);
  }, [center, map]);
  return null;
};

const MapEventsHandler = ({ onMove }: { onMove: (lat: number, lng: number) => void }) => {
  const map = useMap();
  useEffect(() => {
    const handleMove = () => {
      const c = map.getCenter();
      onMove(c.lat, c.lng);
    };
    map.on('moveend', handleMove);
    return () => { map.off('moveend', handleMove); };
  }, [map, onMove]);
  return null;
};

const AddJobModal: React.FC<AddJobModalProps> = ({ onClose, t }) => {
  const [view, setView] = useState<'form' | 'map'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', company: '', jobType: JobType.FULL_TIME, salary: '',
    city: 'کابل', address: '', description: '', 
    phoneNumber: '', 
    location: null as {lat: number, lng: number} | null
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempLocation, setTempLocation] = useState({ lat: 34.5553, lng: 69.2075 });
  const [mapTarget, setMapTarget] = useState({ lat: 34.5553, lng: 69.2075 });

  const handleInputChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleLocateMe = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMapTarget({ ...newLoc });
        setTempLocation(newLoc);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
        alert("دریافت موقعیت با خطا مواجه شد.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = '';
      if (selectedFile) finalImageUrl = await uploadImage(selectedFile);

      const { error } = await supabase.from(TABLES.JOBS).insert([{
        title: formData.title,
        company: formData.company,
        salary: parseFloat(formData.salary) || 0,
        currency: 'AFN',
        job_type: formData.jobType,
        address: formData.address,
        city: formData.city,
        description: formData.description,
        phone_number: formData.phoneNumber,
        location: formData.location || tempLocation,
        images: finalImageUrl ? [finalImageUrl] : [`https://picsum.photos/seed/job-${Date.now()}/800/600`],
        status: 'PENDING'
      }]);
      if (error) throw error;
      setIsSuccess(true);
    } catch (err) {
      alert("خطا در ثبت آگهی استخدام.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 text-center animate-in zoom-in duration-300 shadow-2xl">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={40} /></div>
        <h2 className="text-2xl font-black mb-2">ثبت شد!</h2>
        <p className="text-base text-gray-500 mb-8 font-bold leading-7">آگهی استخدام شما در نوبت تایید قرار گرفت.</p>
        <button onClick={() => window.location.reload()} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-lg">متوجه شدم</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 md:backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-xl md:rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        
        {view === 'map' && (
          <div className="absolute inset-0 z-[110] flex flex-col bg-white animate-in fade-in duration-300">
            <div className="h-16 flex items-center px-6 border-b shrink-0 bg-white shadow-sm">
              <button onClick={() => setView('form')} className="p-2 -mr-2"><ChevronRight size={32} /></button>
              <h2 className="font-black text-lg mr-2">محل شرکت روی نقشه</h2>
            </div>
            <div className="flex-1 relative bg-gray-100">
              <MapContainer center={[tempLocation.lat, tempLocation.lng]} zoom={14} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapController center={mapTarget} />
                <MapEventsHandler onMove={(lat, lng) => setTempLocation({ lat, lng })} />
              </MapContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-[1000] pointer-events-none pb-4">
                <MapPin size={48} className="text-blue-600 drop-shadow-2xl animate-bounce" />
              </div>
              
              <button 
                onClick={handleLocateMe}
                disabled={isLocating}
                className="absolute bottom-32 right-6 p-4 bg-white text-blue-600 rounded-2xl shadow-2xl z-[1000] border border-gray-100 flex items-center justify-center active:scale-90"
              >
                {isLocating ? <Loader2 size={28} className="animate-spin" /> : <Crosshair size={28} />}
              </button>

              <div className="absolute bottom-10 left-8 right-8 z-[1000]">
                <button onClick={() => { handleInputChange('location', tempLocation); setView('form'); }} className="w-full bg-blue-600 text-white py-4.5 rounded-2xl font-black text-lg shadow-2xl active:scale-95 transition-all">تایید موقعیت شرکت</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center p-5 border-b shrink-0 bg-white">
          <h2 className="font-black text-xl text-gray-800">ثبت آگهی استخدام</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={32} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 no-scrollbar pb-32">
          <form id="job-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-4 gap-3">
              {preview && (
                <div className="relative aspect-square rounded-2xl overflow-hidden border shadow-sm">
                  <img src={preview} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => {setSelectedFile(null); setPreview('');}} className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-lg"><Trash2 size={16} /></button>
                </div>
              )}
              {!preview && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:border-blue-600 transition-all">
                  <Camera size={32} /> <span className="text-[10px] mt-1 font-black">لوگو / عکس</span>
                </button>
              )}
              <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="space-y-4">
              <input type="text" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="عنوان شغلی" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base font-bold outline-none" required />
              <input type="text" value={formData.company} onChange={e => handleInputChange('company', e.target.value)} placeholder="نام شرکت" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-base font-bold outline-none" required />
              
              <div className="grid grid-cols-2 gap-4">
                 <select value={formData.jobType} onChange={e => handleInputChange('jobType', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none">
                   {Object.values(JobType).map(type => (<option key={type} value={type}>{type}</option>))}
                 </select>
                 <input type="number" value={formData.salary} onChange={e => handleInputChange('salary', e.target.value)} placeholder="حقوق (افغانی)" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none" required />
              </div>

              <div className="relative">
                <Smartphone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                <input type="tel" value={formData.phoneNumber} onChange={e => handleInputChange('phoneNumber', e.target.value)} placeholder="شماره تماس" className="w-full bg-gray-50 border border-gray-200 rounded-2xl pr-12 pl-5 py-4 font-bold outline-none text-left dir-ltr" required />
              </div>

              <button type="button" onClick={() => setView('map')} className={`w-full border-2 border-dashed rounded-2xl p-5 flex items-center justify-center gap-2 transition-all font-black text-sm ${formData.location ? 'text-blue-600 bg-blue-50 border-blue-200 shadow-inner' : 'text-gray-400 border-gray-200 hover:border-blue-600'}`}>
                <MapPin size={28} /> {formData.location ? 'مکان انتخاب شد' : 'تعیین آدرس روی نقشه'}
              </button>

              <select value={formData.city} onChange={e => handleInputChange('city', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none">
                {t.provinces.map((prov: string) => <option key={prov} value={prov}>{prov}</option>)}
              </select>
              <textarea rows={4} value={formData.description} onChange={e => handleInputChange('description', e.target.value)} placeholder="توضیحات و شرایط..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 font-bold outline-none resize-none transition-all"></textarea>
            </div>
          </form>
        </div>

        <div className="p-5 border-t bg-white flex gap-4 shrink-0 shadow-inner z-20">
          <button form="job-form" type="submit" disabled={isSubmitting} className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl disabled:bg-blue-300 transition-all flex items-center justify-center gap-2">
            {isSubmitting ? <Loader2 size={28} className="animate-spin" /> : 'ثبت نهایی آگهی'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-black text-lg">انصراف</button>
        </div>
      </div>
    </div>
  );
};
export default AddJobModal;