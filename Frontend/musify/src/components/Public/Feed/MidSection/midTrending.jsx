import React, {useState, useEffect, useContext} from 'react'
import { useSelector, useDispatch } from 'react-redux';
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
import PostCardLoader from '../../../../pages/Admin/Loaders/PostCardLoader';
import FeedEmptyState from '../../Profile/InnerComponents/FeedEmptyState';
import {
  setTrendingPosts,
  setHasMore,
  setCurrentPage,
  setLoading,
  setError,
  updateFollowStatusInStore,
  clearFeedData,
  setPaginationLoading,
  prependNewPosts,
} from '../../../../redux/auth/Slices/feedPostsSlice';
import { getBackendUrl } from '../../../../services/config';
import { getConfig } from '../../../../config';





function MidTrending() {
  const dispatch = useDispatch();
  const {
    trendingPosts: posts,
    hasMore,
    currentPage,
    isLoading: loading,
    error,
    lastFetchTime,
    isPaginationLoading
  } = useSelector((state) => state.feedPosts);


  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { profile } = useContext(ProfileContext);
  const [shouldRefresh, setShouldRefresh] = useState(false)
  const { imageUrl } = profile;

  const gatewayUrl = getBackendUrl();
  const { cloudinaryUrl: baseCloudinaryUrl } = getConfig()

  const [followStatus, setFollowStatus] = useState({}); 
  // const [currentPage, setCurrentPage] = useState(1); // Start with page 1
  // const [hasMore, setHasMore] = useState(true);

    // Modal and upload state
  const [file, setFile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [description, setDescription] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

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
    




    const fetchTrendingPosts = async (page, isInitial = false) => {
      try {
        if (isInitial) {
          dispatch(setLoading(true));
        } else {
          dispatch(setPaginationLoading(true));
        }
    
        const response = await axiosInstance.get(`/content/trending/?page=${page}`);
        
        if (response.data.results.length === 0) {
          dispatch(setHasMore(false));
          if (isInitial) {
            dispatch(setError("No trending posts available at the moment."));
          }
          return;
        }
    
        dispatch(setTrendingPosts({ 
          posts: response.data.results, 
          isInitial 
        }));
        
        // Update follow status
        const updatedFollowStatus = { ...followStatus };
        response.data.results.forEach((post) => {
          updatedFollowStatus[post.user_id] = post.follow_status;
        });
        setFollowStatus(updatedFollowStatus);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          dispatch(setHasMore(false));
        } else {
          dispatch(setError("Failed to load trending posts. Please try again later."));
        }
      } finally {
        if (isInitial) {
          dispatch(setLoading(false));
        } else {
          dispatch(setPaginationLoading(false));
        }
        setIsLoadingMore(false);
      }
    };

    useEffect(() => {
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (
        posts.length === 0 || 
        !lastFetchTime || 
        Date.now() - lastFetchTime > CACHE_DURATION ||
        shouldRefresh
      ) {
        // Fetch new data if cache is empty, expired, or refresh is needed
        dispatch(setLoading(true));
        dispatch(setError(''));
        dispatch(setHasMore(true));
        dispatch(setCurrentPage(1));
        fetchTrendingPosts(1, true);
      }
    }, [shouldRefresh]);


    

    useEffect(() => {
      let timeoutId;
      
      const handleScroll = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
  
        timeoutId = setTimeout(() => {
          if (
            window.innerHeight + document.documentElement.scrollTop + 100 >= 
            document.documentElement.offsetHeight
          ) {
            if (hasMore && !isLoadingMore && !loading && !isPaginationLoading) {
              setIsLoadingMore(true);
              const nextPage = currentPage + 1;
              dispatch(setCurrentPage(nextPage));
            }
          }
        }, 200);
      };
      
      window.addEventListener("scroll", handleScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      };
    }, [hasMore, isLoadingMore, loading, currentPage, isPaginationLoading]);
  
    useEffect(() => {
      if (currentPage > 1) {
        fetchTrendingPosts(currentPage, false);
      }
    }, [currentPage]);


    useEffect(() => {
      if (currentPage > 1) {
        fetchTrendingPosts(currentPage)
          .finally(() => {
            setIsLoadingMore(false); // Reset loading flag after fetch completes
          });
      }
    }, [currentPage]);



    // In MidTrending component, add this separate useEffect:
useEffect(() => {
  const fetchNewPostsInBackground = async () => {
    // Only proceed if we already have posts in Redux
    if (posts.length === 0) return;

    try {
      const response = await axiosInstance.get('/content/trending/?page=1');
      
      if (response.data.results?.length > 0) {
        dispatch(prependNewPosts(response.data.results));
        
        // Update follow status for new posts
        const updatedFollowStatus = { ...followStatus };
        response.data.results.forEach((post) => {
          updatedFollowStatus[post.user_id] = post.follow_status;
        });
        setFollowStatus(updatedFollowStatus);
      }
    } catch (error) {
      console.error('Background fetch failed:', error);
    }
  };

  // Run once when component mounts and posts exist
  fetchNewPostsInBackground();
}, []); 



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
  

const updateFollowStatus = (userId, status) => {
  setFollowStatus(prevStatus => ({
    ...prevStatus,
    [userId]: status,
  }));
  dispatch(updateFollowStatusInStore({ userId, status }));
};


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
    
        // const cloudinaryUrl = `${import.meta.env.VITE_CLOUDINARY_URL}/upload`;
        const cloudinaryUrl = `${baseCloudinaryUrl}/upload`; // Construct the upload URL
        let publicId = null;
    
        try {
          const response = await axios.post(cloudinaryUrl, formData, {
            onUploadProgress: (progressEvent) => {
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
          toast.error(`Error uploading ${fileType}.`);
    
          // Delete the file from Cloudinary if an error occurs after upload
          if (publicId) {
            await deleteFileFromCloudinary(publicId);
          }
        }
      } catch (error) {
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



    const handleRetry = () => {
      dispatch(clearFeedData());
      setShouldRefresh(prev => !prev);
    };



    return (
      <>
        <div className='flex flex-col bg-white z-10 items-start sticky top-[70px] p-6 pb-0 w-full'>
          <h2 className='text-lg font-semibold mb-4'>Trending Posts</h2>
          
          {/* Upload Section */}
          <div className='flex items-center w-full mb-6'>
            <div className='w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center mr-4'>
              {imageUrl ? (
                <img
                  src={`${imageUrl}`}
                  alt='Profile'
                  className='w-full h-full object-cover transition duration-300 ease-in-out'
                />
              ) : (
                <FaUser className='text-gray-500 text-2xl' />
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
  
        {/* Content Section */}
        {error ? (
  <div className='flex flex-col items-center justify-center text-center mt-10'>
    <FeedEmptyState
      title="Oops!"
      description={error}
      onRetry={handleRetry}
    />
  </div>
) : loading ? ( // Only show loading shimmer for initial load
  [...Array(2)].map((_, index) => <PostCardLoader key={index} />)
) : posts.length === 0 ? (
  <EmptyState
    title="No Trending Posts Yet"
    description="Check back later or try refreshing."
  />
) : (
  <div className='grid grid-cols-1 gap-6'>
    {posts.map((post) => (
      <PostCard
        key={`${post.id}-${post.timestamp}`}
        onPostClick={() => openPostDetailModal(post)}
        post={post}
        imageUrl={imageUrl}
        userId={post.user_id}
        followStatus={followStatus[post.user_id] || 'follow'}
        updateFollowStatus={updateFollowStatus}
      />
    ))}
    {isPaginationLoading && <LoadingSpinner />} {/* Show spinner only during pagination */}
  </div>
)}

{!hasMore && posts.length > 0 && (
  <div className="text-center py-4 text-gray-500">No more posts to load.</div>
)}
  
        {/* Modals */}
        {isPostModalOpen && (
          <PostDetailModal
            post={selectedPost}
            onClose={closePostDetailModal}
            setShouldRefresh={setShouldRefresh}
            shouldRefresh={shouldRefresh}
          />
        )}
  
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
    );
}

export default MidTrending;