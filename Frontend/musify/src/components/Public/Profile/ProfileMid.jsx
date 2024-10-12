import React, { useContext,useEffect, useState } from 'react';
import {  FaVideo, FaMusic, FaUser, FaUpload } from 'react-icons/fa';
import { ProfileContext } from '../../../context/ProfileContext';
import axiosInstance from '../../../axios/authInterceptor';
import {toast} from 'react-hot-toast';
import FilePreviewModal from '../../Upload/FilePreviewModal';
import axios from 'axios';
import LoadingSpinner from './InnerComponents/LoadingSpinner';
import EmptyState from './InnerComponents/EmptyState';
import MediaDisplay from './InnerComponents/MediaDisplay';

function ProfileMid() {

  const { profile } = useContext(ProfileContext)
  
  const gatewayUrl = import.meta.env.VITE_BACKEND_URL
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_NAME}/upload`;
  const [mediaData, setMediaData] = useState([]);
  const [loading, setLoading] = useState(true); 

  const [isVerifying, setIsVerifying] = useState(false); 

  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchMediaData = async () => {
      setLoading(true); 
      try {
        const response = await axiosInstance.get('/content/uploads/');
        console.log("Response from uploads endpoint:", response.data); // Log the response data
        setMediaData(response.data); // Update state with fetched data
      } catch (error) {
        console.error('Error fetching media data', error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };
  
    fetchMediaData();
  }, [uploadCount]); // Run again when uploadCount changes
  



    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
      setIsModalOpen(true);
    };
  
    const handleCloseModal = () => {
      setFile(null);
      setDescription('');
      setIsModalOpen(false);
    };
    const handleVerifySession = async () => {
      try {
        const response = await axiosInstance.get('/content/verify-user/');
        if (response.status === 200) {
          return true;
        }
      } catch (error) {
        toast.error("Session verification failed. Please log in again.");
        return false; 
      }
    };

    const handleSaveFile = async (croppedImage) => {
      try {
        setIsVerifying(true);
        setUploadProgress(0); // Initialize progress to 0
    
        const isSessionValid = await handleVerifySession();
        if (!isSessionValid) {
          setIsVerifying(false);
          return;
        }
    
        let file = croppedImage;
        if (!file) {
          console.error('No file selected for upload.');
          return;
        }
    
        let fileType;
        let uploadPreset;
        if (file.type.startsWith('image/')) {
          fileType = 'image';
          uploadPreset = 'musify_image_preset';
        } else if (file.type.startsWith('video/')) {
          fileType = 'video';
          uploadPreset = 'musify_videos_preset';
        } else if (file.type.startsWith('audio/')) {
          fileType = 'audio';
          uploadPreset = 'musify_audio_preset';
        } else {
          toast.error('File format not supported.');
          setIsVerifying(false);
          return;
        }
    
        const folder = `musify/users/${fileType}/${profile.username}/`;
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', folder);
    
        const cloudinaryUrl = `${import.meta.env.VITE_CLOUDINARY_URL}/upload`;
        let publicId = null;
    
        try {
          const response = await axios.post(cloudinaryUrl, formData, {
            onUploadProgress: (progressEvent) => {
              // Calculate the upload percentage
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted); // Update the upload progress state
            }
          });
    
          if (response.status === 200) {
            const fileUrl = response.data.secure_url;
            publicId = response.data.public_id;
    
            // Save the upload details to your backend
            const saveResponse = await axiosInstance.post('/content/save-upload/', {
              file_url: fileUrl,
              file_type: fileType,
              folder: folder,
              username: profile.username,
              description: description,
            });
    
            if (saveResponse.status == 200) {
              toast.success('File uploaded and saved successfully!');
              setUploadCount(prevCount => prevCount + 1);
            } else {
              toast.error('File saving error happened!');
    
              // Delete the file from Cloudinary if backend saving fails
              if (publicId) {
                await deleteFileFromCloudinary(publicId);
              }
            }
    
          } else {
            toast.error(`Failed to upload ${fileType}.`);
          }
        } catch (error) {
          console.error(`Error uploading ${fileType}:`, error);
          toast.error(`Error uploading ${fileType}.`);
    
          // Delete the file from Cloudinary if an error occurs after upload
          if (publicId) {
            await deleteFileFromCloudinary(publicId);
          }
        }
      } catch (error) {
        console.error('Error during file save:', error);
        toast.error('Something went wrong while saving the file.');
      } finally {
        setIsVerifying(false);
        setUploadProgress(0); // Reset progress
        setIsModalOpen(false);
      }
    };
    
    // Function to delete the file from Cloudinary
    const deleteFileFromCloudinary = async (publicId) => {
      try {
        const deleteUrl = `${import.meta.env.VITE_CLOUDINARY_URL}/destroy`;
        const deleteResponse = await axios.post(deleteUrl, {
          public_id: publicId,
        });
    
        if (deleteResponse.status === 200) {
          console.log('File deleted successfully from Cloudinary.');
        } else {
          console.error('Failed to delete file from Cloudinary.');
        }
      } catch (error) {
        console.error('Error deleting file from Cloudinary:', error);
      }
    };
    
    

  


  return (
    <div className="flex flex-col items-start p-6 w-full reverse-container">

      <h2 className="text-lg font-semibold mb-4">Activity</h2>


      <div className="flex items-center w-full mb-6">
   
        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center mr-4">

          {profile.imageUrl?(
            <img
            src={`${gatewayUrl}${profile.imageUrl}`}
            alt="Profile"
            className="w-full h-full object-cover transition duration-300 ease-in-out"
          />
          ) 
          :(
            <FaUser className="text-gray-500 text-2xl" /> // Display user icon if no image
          )}

        </div>

        <div className="flex-grow relative">
          <input
            type="text"
            className="w-full px-4 py-2 bg-gray-100 rounded-full placeholder-gray-600 focus:outline-none"
            placeholder="What's new"
            readOnly
          />

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">

          <label htmlFor="file-upload">
            <FaUpload className="text-gray-600 h-4 w-4 cursor-pointer" />
          </label>

            <input 
            id='file-upload'
            type="file"
            accept='image/*,video/*,audio/*'
            style={{display:'none'}}
            onChange={handleFileChange}
             />
            <FaVideo className="text-gray-600  h-4 w-4 cursor-pointer" />
          </div>
        </div>
      </div>

      {loading ? (
  <div className="flex justify-center items-center w-full h-full mt-[-200px] md:mt-[-150px] sm:mt-[-100px]">
    <LoadingSpinner />
  </div>
) : mediaData.length === 0 ? (
  <EmptyState />
) : (
  <MediaDisplay mediaData={mediaData} />
)}


        <FilePreviewModal
          file={file}
          isModalOpen={isModalOpen}
          handleCloseModal={handleCloseModal}
          handleSaveFile={handleSaveFile}
          isVerifying={isVerifying}
          uploadProgress={uploadProgress}
          description={description} // Pass description as prop
          setDescription={setDescription} // Pass setDescription as prop
        />




    </div>
  );
}

export default ProfileMid;
