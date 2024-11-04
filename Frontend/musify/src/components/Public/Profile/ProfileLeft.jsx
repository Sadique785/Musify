import React, { useContext, useEffect, useState } from 'react';
import { useParams,useNavigate  } from 'react-router-dom';
import {useSelector} from 'react-redux'
import { FaEdit, FaGuitar,  FaComments, FaMicrophone, FaMusic, FaCamera, FaUser, FaTimes } from 'react-icons/fa';
import axiosInstance from '../../../axios/authInterceptor';
import { UserProfileContext } from '../../../context/UserProfileProvider';
import { ProfileContext } from '../../../context/ProfileContext';
import toast from 'react-hot-toast';
import talents from '../Elements/Talents'
import genres from '../Elements/Genres'
import ProfileFollowButton from './InnerComponents/ProfileFollowButton';


function ProfileLeft() {
  const { userProfile, setUserProfile, loading } = useContext(UserProfileContext);
  const { setProfile: setGlobalProfile } = useContext(ProfileContext)
  const loggedInUsername = useSelector((state) => state.auth.user?.username)
  const navigate = useNavigate();
  const { username } = useParams(); // Assume params provide the username of the viewed profile
  const gatewayUrl = import.meta.env.VITE_BACKEND_URL
  const [isModalOpen, setIsModalOpen] = useState(false);  // Modal initially closed
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const isOwnProfile = loggedInUsername === username; 


  useEffect( () => {
    const fetchsomething = async ()=> {
      const response = await axiosInstance.get('/friends/status/')
      if (response.status == 200){
        // toast.success('Everything went fineeeee')
        console.log('everything fine');
        
      }

    }
    fetchsomething();
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
        const response = await axiosInstance.put('/auth/change-profile-image/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          console.log('Image uploaded successfully:', response.data.image);

          // Update the profile state with the new image URL
          setUserProfile((prevProfile) => ({
            ...prevProfile,
            imageUrl: response.data.image,
          }));
          setGlobalProfile((prevProfile) => ({
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



  
  console.log('User ID:', userProfile.userId);
  console.log('Current follow status:', userProfile.followStatus);

  return (
    <div className="relative flex flex-col items-center p-6 pl-24 mt-[-190px] w-full">
      {/* Profile Image Wrapper */}
      <div className="relative w-32 h-32 cursor-pointer" onClick={toggleModal}>
        {/* Profile Image */}
        <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
        {loading ? (
            <div className="w-full h-full bg-gray-400 animate-pulse rounded-full"></div>
          ) : userProfile.imageUrl ? (
            <img
              src={`${gatewayUrl}${userProfile.imageUrl}`}
              alt="Profile"
              className="w-full h-full object-cover transition duration-300 ease-in-out"
            />
          ) : (
            <FaUser className="text-gray-500 text-6xl" />
          )}
        </div>
  
        {/* Hover Overlay */}
        {!loading && (
          <div className="absolute inset-0 bg-gray-800 bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
            <FaCamera className="text-white text-xl" />
          </div>
        )}

      </div>
  
      {/* Username */}
      {loading ? (
        <div className="h-6 w-24 bg-gray-400 rounded animate-pulse mx-auto mt-4"></div>
      ) : (
        <h2 className="text-xl h-6 w-24 font-semibold text-center mt-4">
          {userProfile.username}
        </h2>
      )}
      {/* Conditional Buttons */}

      {isOwnProfile ? (
        <button
          onClick={handleEditProfile}
          className="mt-4 bg-[#421b1b] flex items-center justify-center px-4 py-2 text-white rounded-lg hover:bg-[#5c2727]"
        >
          <FaEdit className="mr-2" />
          Edit Profile
        </button>
      ) : (
        <div className="flex space-x-4 mt-4">
          <button className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <FaComments />
            <span>Chat</span>
          </button>
          <ProfileFollowButton userId={userProfile.userId} followStatus={userProfile.followStatus} loading={loading}/>
        </div>
      )}
  
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
              ) : userProfile.imageUrl ? (
                <img
                  src={`${gatewayUrl}${userProfile.imageUrl}`}
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
            {isOwnProfile && (
              <>
              <label
              htmlFor="file-input"
              className="mt-4 bg-[#421b1b] flex items-center justify-center px-4 py-2 text-white rounded-lg hover:bg-[#5c2727] w-full cursor-pointer"
            >
              <FaCamera className="mr-2" />
              Replace Image
            </label>
              </>
            )}
  
            {isOwnProfile && selectedImage && (
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
          <h3 className="text-xl font-semibold">{userProfile.followersCount}</h3>
          <p className="text-sm font-semibold text-gray-500">Followers</p>
        </div>
  
        <div className="text-center">
          <h3 className="text-xl font-semibold">10</h3>
          <p className="text-sm font-semibold text-gray-500">Posts</p>
        </div>
  
        <div className="text-center">
          <h3 className="text-xl font-semibold">{userProfile.followingCount}</h3>
          <p className="text-sm font-semibold text-gray-500">Following</p>
        </div>
      </div>
  
      {/* Talents Section */}
      <div className="w-full mt-8">
        <h2 className="text-md font-semibold text-gray-700 mb-4">Talents</h2>
        <div className="flex flex-wrap gap-2">
          {loading
            ? Array(3)
                .fill()
                .map((_, index) => (
                  <div key={index} className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                ))
            : userProfile.talents.length > 0
            ? userProfile.talents.map((talent) => {
                const talentItem = talents.find((t) => t.name === talent);
                return talentItem ? (
                  <div
                    key={talentItem.id}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                  >
                    <div className="mr-2">{talentItem.icon}</div>
                    <span className="text-sm text-gray-700">{talentItem.name}</span>
                  </div>
                ) : null;
              })
            : <p className="text-sm text-gray-500">No talents added</p>}
        </div>
      </div>
  
      {/* Favorite Genres Section */}
      <div className="w-full mt-8">
        <h2 className="text-md font-semibold text-gray-700 mb-4">Fav Genres</h2>
        <div className="flex flex-wrap gap-2">
          {loading
            ? Array(3)
                .fill()
                .map((_, index) => (
                  <div key={index} className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                ))
            : userProfile.genres.length > 0
            ? userProfile.genres.map((genre) => {
                const genreItem = genres.find((g) => g.name === genre);
                return genreItem ? (
                  <div
                    key={genreItem.id}
                    className="flex items-center bg-gray-100 rounded-full px-3 py-1"
                  >
                    <div className="mr-2">{genreItem.icon}</div>
                    <span className="text-sm text-gray-700">{genreItem.name}</span>
                  </div>
                ) : null;
              })
            : <p className="text-sm text-gray-500">No favorite genres added</p>}
        </div>
      </div>

    </div>
  );
  


};

export default ProfileLeft;