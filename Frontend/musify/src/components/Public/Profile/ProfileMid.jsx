import React from 'react';
import { FaImage, FaVideo, FaMusic } from 'react-icons/fa';

function ProfileMid() {
  return (
    <div className="flex flex-col items-start p-6 w-full reverse-container">

      <h2 className="text-lg font-semibold mb-4">Activity</h2>


      <div className="flex items-center w-full mb-6">
   
        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center mr-4">
          <img
            src="profile/profile.jpg"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-grow relative">
          <input
            type="text"
            className="w-full px-4 py-2 bg-gray-100 rounded-full placeholder-gray-600 focus:outline-none"
            placeholder="What's new"
            readOnly
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
            <FaImage className="text-gray-600 h-4 w-4 cursor-pointer" />
            <FaVideo className="text-gray-600  h-4 w-4 cursor-pointer" />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full mt-8">

        <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mb-4">
          <FaMusic className="text-white h-10 w-10 mr-1  text-4xl" />
        </div>

        <p className="text-md font-semibold text-gray-700 mb-4">
          Hey, It’s time to make music!
        </p>

        <button className="bg-[#421b1b] text-white px-6 py-2 rounded-full hover:bg-[#5c2727]">
          Get Started
        </button>
      </div>
    </div>
  );
}

export default ProfileMid;
