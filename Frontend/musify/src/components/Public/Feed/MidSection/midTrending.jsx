import React, {useState, useEffect, useContext} from 'react'
import axiosInstance from '../../../../axios/authInterceptor';
import PostCard from '../InnerComponents/PostCard';
import LoadingSpinner from '../../Profile/InnerComponents/LoadingSpinner';
import EmptyState from '../../Profile/InnerComponents/EmptyState';
import { ProfileContext } from '../../../../context/ProfileContext';
import FilePreviewModal from '../../../Upload/FilePreviewModal';
import { FaVideo, FaUser, FaUpload } from 'react-icons/fa';
import { toast } from 'react-hot-toast'
import axios from 'axios';
import PostDetailModal from '../InnerComponents/PostDetailModal';



function MidTrending() {

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useContext(ProfileContext);
  const [shouldRefresh, setShouldRefresh] = useState(false)
  const { imageUrl } = profile;
  const gatewayUrl = import.meta.env.VITE_BACKEND_URL




    // Modal and upload state
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [selectedPost, setSelectedPost] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const openPostDetailModal = (post) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

    const closePostDetailModal = () => {
      setSelectedPost(null);
      setIsPostModalOpen(false);
    };



  useEffect(() => {
    const fetchTrendingPosts = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/content/trending/');
        console.log("Fetched posts:", response.data);
        setPosts(response.data.results);
      } catch (error) {
        console.error('Error fetching trending posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingPosts();
  }, [shouldRefresh]);

  useEffect(() => {
    if (isPostModalOpen) {
      // Disable scrolling on the body
      document.body.style.overflow = 'hidden';
    } else {
      // Enable scrolling on the body
      document.body.style.overflow = 'auto';
    }
  
    // Cleanup function to reset overflow when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isPostModalOpen]);
  


    // Handle file change
    const handleFileChange = (e) => {
      setFile(e.target.files[0]);
      setIsModalOpen(true);
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    
<>
    <div className='flex  flex-col bg-white z-10  items-start sticky top-[70px] p-6 pb-0  w-full '>
      <h2 className='text-lg font-semibold mb-4'>Trending Posts</h2>

      {/* Upload Section */}
      <div className='flex items-center w-full mb-6'>
        <div className='w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center mr-4'>
          {imageUrl ? (
            <img
            src={`${gatewayUrl}${imageUrl}`}
            alt='Profile'
              className='w-full h-full object-cover transition duration-300 ease-in-out'
            />
          ) : (
            <FaUser className='text-gray-500 text-2xl' /> // Display user icon if no image
          )}
        </div>

        <div className='flex-grow relative'>
          <input
            type='text'
            className='w-full px-4 py-2 bg-gray-100 rounded-full placeholder-gray-600 focus:outline-none'
            placeholder="What's new"
            readOnly
          />

          <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2'>
            <label htmlFor='file-upload'>
              <FaUpload className='text-gray-600 h-4 w-4 cursor-pointer' />
            </label>
            <input
              id='file-upload'
              type='file'
              accept='image/*,video/*,audio/*'
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <FaVideo className='text-gray-600 h-4 w-4 cursor-pointer' />
          </div>
        </div>
      </div>
    </div>



        <div className='grid grid-cols-1 gap-6'>
              {posts.map((post)=> (
                <div key={post.id}  >
                <PostCard
                key={post.id}
                onPostClick={() => openPostDetailModal(post)}
                post={post}
                 imageUrl={imageUrl} />
              </div>
              ))}

        </div>


        {isPostModalOpen && (
        <PostDetailModal
          post={selectedPost}
          onClose={closePostDetailModal}
          setShouldRefresh={setShouldRefresh}
          shouldRefresh={shouldRefresh}
        />
      )}


                  {/* File Preview Modal */}
      <FilePreviewModal
        file={file}
        isModalOpen={isModalOpen}
        handleCloseModal={() => setIsModalOpen(false)}
        handleSaveFile={handleSaveFile}
        isVerifying={isVerifying}
        uploadProgress={uploadProgress}
        description={description}
        setDescription={setDescription}
        
      />

</>
  )
}

export default MidTrending;