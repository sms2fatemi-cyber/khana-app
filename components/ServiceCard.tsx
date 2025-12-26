import React from 'react';
import { Service } from '../types';
import { Bookmark, Wrench } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
  isVisited?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, isVisited }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[2rem] p-4 flex gap-4 cursor-pointer hover:shadow-xl transition-all border border-transparent hover:border-gray-100 relative shadow-sm group ${isVisited ? 'opacity-85' : ''}`}
    >
      <div className="flex-1 flex flex-col justify-between py-1 text-right">
        <div>
          <div className="flex justify-between items-start">
             <span className="bg-orange-50 text-orange-600 text-[10px] font-black px-2 py-0.5 rounded-lg">خدمات فنی</span>
             <button className="text-gray-300 hover:text-red-500 transition-colors"><Bookmark size={18} /></button>
          </div>
          <h3 className="font-black text-gray-800 text-[15px] leading-7 mt-2 line-clamp-2">{service.title}</h3>
          <p className="text-gray-400 text-[11px] font-bold mt-1">{service.providerName}</p>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><Wrench size={14} /></div>
          <span className="text-gray-600 font-black text-xs">سابقه: {service.experience}</span>
        </div>
      </div>

      <div className="w-[110px] h-[110px] rounded-[1.8rem] overflow-hidden bg-gray-100 shrink-0 relative shadow-inner">
        <img 
          src={service.images?.[0] || 'https://via.placeholder.com/200'} 
          alt={service.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
      </div>
    </div>
  );
};

export default ServiceCard;