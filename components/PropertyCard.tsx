import React from 'react';
import { Property } from '../types';
import { Bookmark } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isVisited?: boolean;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onClick, isVisited }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[2rem] p-4 flex gap-4 cursor-pointer hover:shadow-xl transition-all border border-transparent hover:border-gray-100 relative shadow-sm group ${isVisited ? 'opacity-85' : ''}`}
    >
      {/* بخش اطلاعات سمت چپ */}
      <div className="flex-1 flex flex-col justify-between py-1 text-right">
        <div>
          <div className="flex justify-between items-start">
             <span className="bg-red-50 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-lg">جدید</span>
             <button className="text-gray-300 hover:text-red-500 transition-colors"><Bookmark size={18} /></button>
          </div>
          <h3 className="font-black text-gray-800 text-[15px] leading-7 mt-2 line-clamp-2">
            {property.title}
          </h3>
          <p className="text-gray-400 text-[11px] font-bold mt-1">
            {property.city} | {property.dealType}
          </p>
        </div>
        
        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-[#a62626] font-black text-xl tracking-tight">
            {property.price.toLocaleString()}
          </span>
          <small className="text-gray-400 text-[10px] font-black uppercase">افغانی</small>
        </div>
      </div>

      {/* تصویر سمت راست */}
      <div className="w-[110px] h-[110px] rounded-[1.8rem] overflow-hidden bg-gray-100 shrink-0 relative shadow-inner">
        <img 
          src={property.images?.[0] || 'https://via.placeholder.com/200'} 
          alt={property.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        {isVisited && (
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
             <span className="bg-white/90 text-black text-[9px] px-2 py-1 rounded-lg font-black shadow-sm">دیده شده</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;