import React from 'react';
import { FaEdit, FaGuitar, FaMicrophone, FaMusic, FaCamera } from 'react-icons/fa';
import axiosInstance from '../../../axios/authInterceptor'

function ProfileLeft() {

  const handleEditProfile = async () => {
    try {
      const response = await axiosInstance.put('/auth/edit-profile/'); 
      if (response.status === 200) {
        console.log('Profile updated successfully!');
        
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
    }
  };


  return (
    <div className="relative flex flex-col items-center p-6 pl-24 mt-[-190px] w-full">
      {/* Profile Image Wrapper */}
      <div className="relative w-32 h-32">
        {/* Profile Image */}
        <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          <img
            src="profile/profile.jpg"
            alt="Profile"
            className="w-full h-full object-cover transition duration-300 ease-in-out"
          />
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <FaCamera className="text-white text-xl" />
        </div>
      </div>

      {/* Username */}
      <h2 className="text-xl font-semibold text-center mt-4">Username</h2>

      {/* Edit Profile Button */}
      <button onClick={handleEditProfile} className="mt-4 bg-[#421b1b] flex items-center justify-center px-4 py-2 text-white rounded-lg hover:bg-[#5c2727]">
        <FaEdit className="mr-2" />
        Edit Profile
      </button>


      <div className='flex justify-around items-center w-full mt-6'>
        <div className="text-center">
          <h3 className="text-xl font-semibold">90</h3>
          <p className='text-sm font-semibold text-gray-500' >Followers</p>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold">9</h3>
          <p className='text-sm font-semibold text-gray-500' >Posts</p>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold">90</h3>
          <p className='text-sm font-semibold text-gray-500' >Following</p>
        </div>


      </div>

      {/* Talents Section */}
      <div className="w-full mt-8">
        <h2 className="text-md font-semibold text-gray-700 mb-4">Talents</h2>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <FaGuitar className="text-gray-600 mr-2" />
            <span className="text-sm text-gray-700">Guitarist</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <FaMicrophone className="text-gray-600 mr-2" />
            <span className="text-sm text-gray-700">Vocalist</span>
          </div>
        </div>
      </div>

      {/* Favorite Genres Section */}
      <div className="w-full mt-8">
        <h2 className="text-md font-semibold text-gray-700 mb-4">Fav Genres</h2>
        <div className="flex flex-wrap gap-2">
          {/* Genre Item */}
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <FaMusic className="text-gray-600 mr-2" />
            <span className="text-sm text-gray-700">Classical</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <FaMusic className="text-gray-600 mr-2" />
            <span className="text-sm text-gray-700">Rap</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileLeft;
