import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedContent } from '../../../../redux/auth/Slices/contentSlice';
import { FaFire, FaUserFriends } from 'react-icons/fa';

const MobileContentSelector = () => {
  const dispatch = useDispatch();
  const selectedContent = useSelector((state) => state.content.selectedContent);

  return (
    <div className="w-full border-b">
      <div className="flex justify-center space-x-8 py-2">
        <div 
          onClick={() => dispatch(setSelectedContent('trending'))}
          className="cursor-pointer"
        >
          <div className="flex items-center space-x-2 px-4 py-2">
            <FaFire className={`text-lg ${selectedContent === 'trending' ? 'text-black' : 'text-gray-500'}`} />
            <span className={`${selectedContent === 'trending' ? 'text-black font-semibold' : 'text-gray-500'}`}>
              Trending
            </span>
          </div>
          <div className={`h-0.5 ${selectedContent === 'trending' ? 'bg-black' : 'bg-transparent'} 
            transition-all duration-300 mx-auto`}
          />
        </div>

        <div 
          onClick={() => dispatch(setSelectedContent('following'))}
          className="cursor-pointer"
        >
          <div className="flex items-center space-x-2 px-4 py-2">
            <FaUserFriends className={`text-lg ${selectedContent === 'following' ? 'text-black' : 'text-gray-500'}`} />
            <span className={`${selectedContent === 'following' ? 'text-black font-semibold' : 'text-gray-500'}`}>
              Following
            </span>
          </div>
          <div className={`h-0.5 ${selectedContent === 'following' ? 'bg-black' : 'bg-transparent'} 
            transition-all duration-300 mx-auto`}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileContentSelector;