import React from 'react';
import { MoreHorizontal, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LibItem({ project }) {
  const navigate = useNavigate();

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent navigation when clicking dropdown
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleItemClick = () => {
    navigate(`/track/${project?.id}`);
  };

  return (
    <div className="p-2">
      <div 
        className="flex items-center justify-between py-4 hover:bg-gray-200 transition-colors rounded-lg cursor-pointer"
        onClick={handleItemClick}
      >
        {/* Left - Image with 3D effect */}
        <div className="relative w-16 h-12 mr-4">
          {/* Bottom layer - lightest */}
          <div className="absolute right-2 -bottom-2 w-12 h-12 bg-[#afaab8] rounded-lg"></div>
          {/* Middle layer */}
          <div className="absolute right-1 -bottom-1 w-12 h-12 bg-[#685d7a] rounded-lg"></div>
          {/* Top layer - darkest */}
          <div className="absolute right-0 w-12 h-12 bg-[#2d2241] rounded-lg flex items-center justify-center">
            <User className="w-6 h-6 text-gray-200" />
          </div>
        </div>

        {/* Middle - Project Info */}
        <div className="flex-1">
          <h3 className="text-base font-semibold">{project?.title || 'Untitled'}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <span>{project?.user || 'Unknown User'}</span>
            <span className="mx-2">•</span>
            <span>{project?.created_at ? formatDate(project.created_at) : 'N/A'}</span>
          </div>
        </div>

        {/* Right - Dropdown */}
        <div>
          <button 
            onClick={handleDropdownClick}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="text-gray-500 w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default LibItem;