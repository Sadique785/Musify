import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedContent } from '../../../redux/auth/Slices/contentSlice';
import { FaFire, FaUserFriends, FaMusic } from 'react-icons/fa';



function FeedLeft() {
    const dispatch = useDispatch();
    const selectedContent = useSelector((state) => state.content.selectedContent);

    const handleContentChange = (content) => {
        console.log(content);
        
        dispatch(setSelectedContent(content));
    }

    const buttonClass = "flex items-center space-x-3 p-2 mb-2 rounded-lg transition";

    return (
        <div className='ml-[90px] fixed left-0'>
          <button
            onClick={() => handleContentChange('trending')}
            className={`${buttonClass} ${selectedContent === 'trending' ? 'bg-gray-200 w-56 font-semibold' : 'hover:bg-gray-200 w-56'}`}
          >
            <div className="bg-gray-300 p-2 rounded-lg">
              <FaFire className="text-gray-700" />
            </div>
            <span>Trending</span>
          </button>
    
          <button
            onClick={() => handleContentChange('following')}
            className={`${buttonClass} ${selectedContent === 'following' ? 'bg-gray-200 w-56 font-semibold' : 'hover:bg-gray-200 w-56'}`}
          >
            <div className="bg-gray-300 p-2 rounded-lg">
              <FaUserFriends className="text-gray-700" />
            </div>
            <span>Following</span>
          </button>
    
          <button
            onClick={() => handleContentChange('music')}
            className={`${buttonClass} ${selectedContent === 'music' ? 'bg-gray-200 w-56 font-semibold' : 'hover:bg-gray-200 w-56'}`}
          >
            <div className="bg-gray-300 p-2 rounded-lg">
              <FaMusic className="text-gray-700" />
            </div>
            <span>Music</span>
          </button>
        </div>
      );
}

export default FeedLeft