import React from 'react';
import { FaMusic } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'

const EmptyState = ({ isOwnProfile }) => {
  const navigate  =  useNavigate();
  const handleGetStarted = () => {
    navigate('/edit');
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mt-8">
      <div className="w-20 h-20 bg-gray-400 rounded-full flex items-center justify-center mb-4">
        <FaMusic className="text-white h-10 w-10 mr-1 text-4xl" />
      </div>
      <p className="text-md font-semibold text-gray-700 mb-4">
        {isOwnProfile
          ? "Hey, It’s time to make music!"
          : "Posts are not currently available"}
      </p>
      {isOwnProfile && (
        <button
        onClick={handleGetStarted}
        className="bg-[#421b1b] text-white px-6 py-2 rounded-full hover:bg-[#5c2727]">
          Get Started
        </button>
      )}
    </div>
  );
};

export default EmptyState;
