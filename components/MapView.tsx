import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Property, Job, Service } from '../types';
import { Crosshair, Loader2 } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface MapViewProps {
  items: (Property | Job | Service)[];
  selectedItem: Property | Job | Service | null;
  onSelectItem: (item: Property | Job | Service) => void;
  mode: 'ESTATE' | 'JOBS' | 'SERVICES';
  visitedIds: Set<string>;
}

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timers = [100, 300, 600, 1000].map(ms => setTimeout(() => map.invalidateSize(), ms));
    const observer = new ResizeObserver(() => map.invalidateSize());
    const container = map.getContainer();
    if (container) observer.observe(container);
    return () => {
      timers.forEach(clearTimeout);
      observer.disconnect();
    };
  }, [map]);
  return null;
};

const UserLocationHandler = () => {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      alert("مرورگر شما از GPS پشتیبانی نمی‌کند.");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 16, { animate: true });
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        if (err.code === 1) alert("لطفاً اجازه دسترسی به مکان (Location) را در مرورگر تایید کنید.");
        else alert("خطا در دریافت موقعیت. مطمئن شوید GPS روشن است.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [map]);

  return (
    <button 
      onClick={handleLocate}
      className="absolute bottom-32 right-6 z-[3000] w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-[#a62626] active:scale-90 transition-all border border-gray-100"
    >
      {isLocating ? <Loader2 size={24} className="animate-spin" /> : <Crosshair size={28} />}
    </button>
  );
};

const MapFlyTo = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0) {
      map.flyTo(center, 15, { animate: true });
    }
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ items, selectedItem, onSelectItem, visitedIds }) => {
  const defaultCenter: [number, number] = [34.5553, 69.2075];

  const createRedIcon = (isVisited: boolean) => {
    const iconMarkup = renderToStaticMarkup(
      <div className="relative flex items-center justify-center">
        <div className={`w-8 h-8 rounded-full border-4 border-white shadow-xl ${isVisited ? 'bg-gray-400' : 'bg-[#a62626]'} flex items-center justify-center`}>
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className={`absolute -bottom-1 w-2 h-2 ${isVisited ? 'bg-gray-400' : 'bg-[#a62626]'} rotate-45`}></div>
      </div>
    );
    return L.divIcon({ html: iconMarkup, className: '', iconSize: [32, 32], iconAnchor: [16, 32] });
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-gray-200">
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapResizer />
        {items.map((item) => (
          <Marker key={item.id} position={[item.location?.lat || 34.5, item.location?.lng || 69.2]} icon={createRedIcon(visitedIds.has(item.id))}>
            <Popup className="custom-popup" closeButton={false}>
              <div className="w-full overflow-hidden cursor-pointer" onClick={() => onSelectItem(item)}>
                <img src={item.images?.[0]} className="w-full h-24 object-cover" />
                <div className="p-2">
                  <h4 className="font-black text-[11px] truncate">{item.title}</h4>
                  <p className="text-[#a62626] font-black text-xs mt-1">{(item as any).price?.toLocaleString() || (item as any).salary?.toLocaleString() || '---'} افغانی</p>
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