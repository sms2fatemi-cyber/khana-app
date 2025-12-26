
import React from 'react';
import { Property } from '../types';
import { Bookmark } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isSelected?: boolean;
  isVisited?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, isVisited, isSaved, onToggleSave }) => {
  // اولویت با اولین عکس از لیست images است، اگر نبود از فیلد تک عکسی قدیمی استفاده کن
  const displayImage = (property.images && property.images.length > 0) 
    ? property.images[0] 
    : (property as any).image;

  const imageUrl = displayImage && displayImage.startsWith('http') 
    ? displayImage 
    : `https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400`;

  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-gray-100 rounded-[1.2rem] p-3 flex gap-3 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all h-[145px] relative overflow-hidden ${isVisited ? 'bg-gray-50/50' : 'shadow-sm'}`}
    >
      <div className="w-[120px] md:w-[150px] h-full rounded-xl overflow-hidden bg-gray-100 shrink-0 relative order-1">
        <img 
          src={imageUrl} 
          alt={property.title} 
          loading="lazy"
          className="w-full h-full object-cover" 
          onError={(e) => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400`;
          }}
        />
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all"
        >
          <Bookmark size={16} className={isSaved ? "fill-white" : ""} />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-between text-right order-2 py-1">
        <div className="space-y-1">
          <div className="flex items-center justify-end">
            <span className="bg-red-50 text-[#a62626] text-[10px] font-black px-2 py-0.5 rounded-md">جدید</span>
          </div>
          <h3 className={`font-black text-gray-800 text-lg line-clamp-1 leading-tight ${isVisited ? 'text-gray-500' : ''}`}>
            {property.title}
          </h3>
          <p className="text-gray-400 text-[11px] font-bold">
            {property.city} | {property.dealType}
          </p>
        </div>
        
        <div className="flex items-baseline justify-end gap-1">
          <span className="text-[#a62626] font-black text-xl">
            {(property.price || 0).toLocaleString()}
          </span>
          <span className="text-[#a62626] text-[10px] font-bold">افغانی</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
