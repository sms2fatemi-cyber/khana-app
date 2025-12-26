import React from 'react';
import { Property } from '../types';
import { Bookmark } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isSelected?: boolean;
  isVisited?: boolean;
  isSaved?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, isVisited, isSaved }) => {
  const displayImage = (property.images && property.images.length > 0) 
    ? property.images[0] 
    : `https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400`;

  return (
    <div 
      onClick={onClick}
      className={`bg-white border-b border-gray-100 p-4 flex gap-4 cursor-pointer active:bg-gray-50 transition-all min-h-[140px] relative ${isVisited ? 'opacity-75' : ''}`}
    >
      {/* بخش اطلاعات در سمت راست (RTL) */}
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div className="space-y-1">
          <h3 className={`font-black text-gray-800 text-[15px] leading-6 line-clamp-2 ${isVisited ? 'text-gray-500' : ''}`}>
            {property.title}
          </h3>
          <div className="flex flex-col gap-0.5">
            <p className="text-gray-400 text-[12px] font-medium">
              {property.status === 'APPROVED' ? 'فوری' : ''} {property.type} {property.dealType}
            </p>
            <p className="text-gray-400 text-[12px] flex items-center gap-1">
              {property.date} در {property.city}
            </p>
          </div>
        </div>
        
        <div className="mt-auto">
          <div className="flex items-center gap-1">
            <span className="text-[#a62626] font-black text-[17px]">
              {property.price === 0 ? 'توافقی' : property.price.toLocaleString()}
            </span>
            {property.price !== 0 && <span className="text-[#a62626] text-[11px] font-bold">افغانی</span>}
          </div>
        </div>
      </div>

      {/* بخش تصویر در سمت چپ */}
      <div className="w-[115px] h-[115px] rounded-lg overflow-hidden bg-gray-50 shrink-0 relative self-center shadow-sm">
        <img 
          src={displayImage} 
          alt={property.title} 
          loading="lazy"
          className="w-full h-full object-cover" 
          onError={(e) => {
            e.currentTarget.src = `https://images.unsplash.com/photo-1582408921715-18e7806365c1?q=80&w=400`;
          }}
        />
        {isSaved && (
          <div className="absolute top-1 left-1 p-1 bg-white/80 backdrop-blur rounded-full">
            <Bookmark size={12} className="fill-[#a62626] text-[#a62626]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;