import React from 'react';
import { FaCamera } from 'react-icons/fa';

function ProfileCover() {
  return (
    <div className="feed-container w-full p-t-3 px-24 relative">
      <div className="relative w-full h-48 bg-gradient-to-r from-[#440C0C] to-[#9C5E5E] rounded-xl overflow-hidden shadow-xl">
        <img
          src=""
          alt="Cover"
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-4 right-4">
          <button
            className="flex items-center space-x-2 rounded-lg p-1 text-gray-200 hover:text-gray-400 transition"
            aria-label="Edit Cover Photo"
          >
            <FaCamera />
            <span className="font-bold"> Cover</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCover;
