
import React from 'react';
import { Service } from '../types';
import { Bookmark } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
  isSelected?: boolean;
  isVisited?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick, isVisited, isSaved, onToggleSave }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border rounded-[1.5rem] p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-all h-[160px] relative group ${isVisited ? 'opacity-70' : ''}`}
    >
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h3 className="font-black text-gray-800 text-sm md:text-base line-clamp-2 group-hover:text-orange-600 transition-colors">{service.title}</h3>
          <p className="text-gray-500 text-xs mt-1 font-bold">{service.providerName}</p>
          <p className="text-gray-400 text-[10px] mt-1 font-bold">{service.city} | {service.category}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-orange-600 font-black text-sm md:text-base">
            سابقه: <span className="font-black">{service.experience}</span>
          </p>
          <span className="text-gray-400 text-[10px] font-bold">{service.date}</span>
        </div>
      </div>
      
      <div className="w-32 h-full rounded-2xl overflow-hidden bg-gray-100 shrink-0 relative shadow-inner">
        {/* Fix: Property 'image' does not exist on type 'Service'. Use 'images[0]' instead. */}
        <img src={service.images?.[0] || `https://picsum.photos/seed/service-${service.id}/400/300`} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSave?.(); }}
          className="absolute top-2 left-2 p-2 rounded-full bg-white/30 backdrop-blur-md text-white hover:bg-white/50 transition-colors"
        >
          <Bookmark size={16} className={isSaved ? "fill-white" : ""} />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
