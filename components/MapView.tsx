
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property, Job, Service, Language } from '../types';
import { Crosshair, MapPin, Briefcase, Wrench, Loader2 } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import { translations } from '../services/translations';

interface MapViewProps {
  items: (Property | Job | Service)[];
  selectedItem: Property | Job | Service | null;
  onSelectItem: (item: Property | Job | Service) => void;
  mode: 'ESTATE' | 'JOBS' | 'SERVICES';
  visitedIds: Set<string>;
}

const MapInvalidator = () => {
  const map = useMap();
  const container = map.getContainer();

  useEffect(() => {
    if (!map || !container) return;

    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });

    observer.observe(container);
    
    const timers = [50, 150, 300, 500, 1000].map(ms => 
      setTimeout(() => map.invalidateSize(), ms)
    );

    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [map, container]);

  return null;
};

const UserLocationHandler = () => {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const lang = (localStorage.getItem('app_lang') as Language) || 'dari';
  const t = translations[lang];

  const handleLocate = () => {
    // Check for Secure Context
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';

    if (!isSecure) {
      alert(t.location_https_error + "\n\nراه حل: از localhost استفاده کنید یا سایت را روی هاست HTTPS آپلود کنید.");
      return;
    }

    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const latlng = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          setPosition(latlng);
          map.flyTo(latlng, 15);
          setIsLocating(false);
          setTimeout(() => map.invalidateSize(), 100);
        },
        (error) => {
          setIsLocating(false);
          let errorMsg = lang === 'dari' ? "خطا در دریافت موقعیت." : "د موقعیت په ترلاسه کولو کې تېروتنه.";
          if (error.code === 1) {
            errorMsg = lang === 'dari' ? "دسترسی به مکان توسط شما رد شد." : "تاسو د ځای لاسرسی رد کړی.";
          }
          alert(errorMsg);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsLocating(false);
      alert(lang === 'dari' ? "مرورگر شما از مکان‌یاب پشتیبانی نمی‌کند." : "ستاسو براوزر د ځای موندنې ملاتړ نه کوي.");
    }
  };

  const userIcon = L.divIcon({
    className: 'user-location-marker',
    html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative"><div class="absolute -inset-2 bg-blue-500 rounded-full opacity-30 animate-ping"></div></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

  return (
    <>
      <button 
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleLocate(); }}
        className="absolute bottom-32 md:bottom-12 right-6 text-[#a62626] z-[3000] active:scale-90 transition-all flex items-center justify-center filter drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)]"
        style={{ background: 'transparent', border: 'none', outline: 'none', WebkitTapHighlightColor: 'transparent' }}
      >
        {isLocating ? <Loader2 size={38} className="animate-spin" /> : <Crosshair size={38} />}
      </button>
      {position && <Marker position={position} icon={userIcon} />}
    </>
  );
};

const MapFlyTo = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
      setTimeout(() => map.invalidateSize(), 300);
    }
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ items, selectedItem, onSelectItem, mode, visitedIds }) => {
  const defaultCenter: [number, number] = [34.5553, 69.2075];
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const createCustomIcon = (isVisited: boolean) => {
    let iconColor = isVisited ? 'bg-gray-400' : (mode === 'JOBS' ? 'bg-blue-600' : mode === 'SERVICES' ? 'bg-orange-600' : 'bg-[#a62626]');
    let IconComponent = mode === 'JOBS' ? Briefcase : mode === 'SERVICES' ? Wrench : MapPin;

    const iconMarkup = renderToStaticMarkup(
      <div className={`w-9 h-9 rounded-full border-2 border-white shadow-xl ${iconColor} flex items-center justify-center text-white transition-all`}>
        <IconComponent size={18} />
      </div>
    );

    return L.divIcon({
      html: iconMarkup,
      className: '', 
      iconSize: [36, 36],
      iconAnchor: [18, 36]
    });
  };

  if (!ready) return <div className="w-full h-full bg-gray-100 animate-pulse flex items-center justify-center font-bold text-gray-400">در حال بارگذاری نقشه...</div>;

  return (
    <div className="w-full h-full bg-[#f1f5f9] relative overflow-hidden">
      <MapContainer 
        center={defaultCenter} 
        zoom={13} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapInvalidator />
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {items.map((item) => (
          <Marker 
            key={item.id} 
            position={[item.location?.lat || 34.5, item.location?.lng || 69.2]}
            icon={createCustomIcon(visitedIds.has(item.id))}
          >
            <Popup className="custom-popup" closeButton={false}>
              <div 
                className="w-48 overflow-hidden rounded-xl cursor-pointer bg-white" 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectItem(item);
                }}
              >
                <div className="relative h-24 w-full bg-gray-100">
                  <img src={item.images?.[0] || 'https://via.placeholder.com/200x150'} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <h3 className="font-bold text-[11px] truncate text-gray-800">{item.title}</h3>
                  <p className="text-[#a62626] font-black text-[11px] mt-1">
                    {'price' in item ? `${(item as any).price.toLocaleString()} AFN` : 'تماس بگیرید'}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {selectedItem && <MapFlyTo center={[selectedItem.location.lat, selectedItem.location.lng]} />}
        <UserLocationHandler />
      </MapContainer>
    </div>
  );
};

export default MapView;
