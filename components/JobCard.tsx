
import React from 'react';
import { Job } from '../types';
import { Bookmark } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick: () => void;
  isSelected?: boolean;
  isVisited?: boolean;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onClick, isVisited, isSaved, onToggleSave }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border rounded-[1.5rem] p-4 flex gap-4 cursor-pointer hover:shadow-lg transition-all h-[160px] relative group ${isVisited ? 'opacity-70' : ''}`}
    >
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h3 className="font-black text-gray-800 text-sm md:text-base line-clamp-2 group-hover:text-blue-700 transition-colors">{job.title}</h3>
          <p className="text-gray-500 text-xs mt-1 font-bold">{job.company}</p>
          <p className="text-gray-400 text-[10px] mt-1 font-bold">{job.city} | {job.jobType}</p>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-blue-700 font-black text-sm md:text-base">
            {job.salary.toLocaleString()} <span className="text-[10px] font-bold">افغانی</span>
          </p>
          <span className="text-gray-400 text-[10px] font-bold">{job.date}</span>
        </div>
      </div>
      
      <div className="w-32 h-full rounded-2xl overflow-hidden bg-gray-100 shrink-0 relative shadow-inner">
        {/* Fix: Property 'image' does not exist on type 'Job'. Use 'images[0]' instead. */}
        <img src={job.images?.[0] || `https://picsum.photos/seed/job-${job.id}/400/300`} alt={job.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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

export default JobCard;
