import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaGuitar, FaMicrophone, FaMusic, FaCamera, FaUser, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../../axios/authInterceptor';

function ProfileLeft() {
  const [Profile, setProfile] = useState({
    username: '',
    imageUrl: '',
  });

  const navigate = useNavigate();
  
  const backendUrl = 'http://localhost:8000';
  const [isModalOpen, setIsModalOpen] = useState(false);  // Modal initially closed
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get('/auth/fetch-profile/');
        console.log(response);

        if (response.status === 200) {
          setProfile({
            username: response.data.username,
            imageUrl: response.data.image_url,
          });
        }
      } catch (error) {
        console.error('Error Fetching the Details', error);
      }
    };

    fetchProfile();
  }, []);

  const handleEditProfile = async () => {
    try {
      navigate('/settings')
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setSelectedImage(null);
    setImagePreview(null);  // Reset when opening/closing modal
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));  // Preview the selected image
    }
  };

  const handleSaveImage = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append('image', selectedImage);

      try {
        const response = await axiosInstance.post('/auth/change-profile-image/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          console.log('Image uploaded successfully:', response.data.image);

          // Update the profile state with the new image URL
          setProfile((prevProfile) => ({
            ...prevProfile,
            imageUrl: response.data.image,
          }));

          // Delay closing the modal slightly to ensure state updates are reflected
          setTimeout(() => {
            toggleModal();  // Close modal after updating the state
          }, 100);  // Slight delay to ensure image updates
        }
      } catch (error) {
        console.error('Error updating profile image:', error);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center p-6 pl-24 mt-[-190px] w-full">
      {/* Profile Image Wrapper */}
      <div className="relative w-32 h-32 cursor-pointer" onClick={toggleModal}>
        {/* Profile Image */}
        <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          {Profile.imageUrl ? (
            <img
              src={`${backendUrl}${Profile.imageUrl}`}
              alt="Profile"
              className="w-full h-full object-cover transition duration-300 ease-in-out"
            />
          ) : (
            <FaUser className="text-gray-500 text-6xl" />
          )}
        </div>
  
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
          <FaCamera className="text-white text-xl" />
        </div>
      </div>
  
      {/* Username */}
      <h2 className="text-xl font-semibold text-center mt-4">{Profile.username}</h2>
  
      {/* Edit Profile Button */}
      <button
        onClick={handleEditProfile}
        className="mt-4 bg-[#421b1b] flex items-center justify-center px-4 py-2 text-white rounded-lg hover:bg-[#5c2727]"
      >
        <FaEdit className="mr-2" />
        Edit Profile
      </button>
  
      {/* Modal for image selection */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-[300px] ">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={toggleModal}
            >
              <FaTimes size={20} />
            </button>
  
            <h2 className="text-lg font-semibold text-center mb-4">Profile Image</h2>
  
            <div className="w-full h-[300px] flex items-center justify-center bg-gray-100 rounded-lg overflow-hidden">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Selected Preview"
                  className="w-full h-full object-cover"
                />
              ) : Profile.imageUrl ? (
                <img
                  src={`${backendUrl}${Profile.imageUrl}`}
                  alt="Profile Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-500 text-6xl" />
              )}
            </div>
  
            {/* Replace Image Button */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="file-input"
            />
            <label
              htmlFor="file-input"
              className="mt-4 bg-[#421b1b] flex items-center justify-center px-4 py-2 text-white rounded-lg hover:bg-[#5c2727] w-full cursor-pointer"
            >
              <FaCamera className="mr-2" />
              Replace Image
            </label>
  
            {/* Save Button */}
            {selectedImage && (
              <button
                className="mt-4 bg-[#421b1b] flex items-center justify-center px-4 py-2 text-white rounded-lg hover:bg-[#5c2727] w-full"
                onClick={handleSaveImage}
              >
                Save
              </button>
            )}
          </div>
        </div>
      )}
  
      <div className="flex justify-around items-center w-full mt-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold">90</h3>
          <p className="text-sm font-semibold text-gray-500">Followers</p>
        </div>
  
        <div className="text-center">
          <h3 className="text-xl font-semibold">9</h3>
          <p className="text-sm font-semibold text-gray-500">Posts</p>
        </div>
  
        <div className="text-center">
          <h3 className="text-xl font-semibold">90</h3>
          <p className="text-sm font-semibold text-gray-500">Following</p>
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
  


};

export default ProfileLeft;