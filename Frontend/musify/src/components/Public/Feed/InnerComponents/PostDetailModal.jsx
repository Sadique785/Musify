import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../../axios/authInterceptor';
import ImageDisplay from './ImageDisplay';
import VideoDisplay from './VideoDisplay';
import AudioPost from './AudioPost'; // Import the AudioPost component
import { FaUserCircle, FaHeart, FaRegHeart, FaShareAlt, FaEllipsisV } from 'react-icons/fa';
import { handleLikeToggle } from '../../../compUtils/likeUtils';

function PostDetailModal({ post, onClose, setShouldRefresh, shouldRefresh }) {
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count);  
  const [recentLikes, setRecentLikes] = useState(post.recent_likes || []);

  const currentUser= useSelector((state) => state.auth.user)



  useEffect(() => {
    const fetchPostDetails = async () => {
        setLoading(true);
        console.log('Fetching post details for ID:', post.id);
        try {
            const response = await axiosInstance.get(`/content/post-detail/${post.id}/`);
            console.log('Detailed Response:', response.data);
            setPostDetails(response.data);
            setIsLiked(response.data.is_liked); 
            setLikesCount(response.data.likes_count); 
        } catch (error) {
            console.error('Error fetching post details:', error);
        } finally {
            setLoading(false);
            console.log('Loading finished for post ID:', post.id);
        }
    };

    fetchPostDetails();
}, [post.id]);
const handleLikeClick = () => {
  const postId = postDetails.id;
  handleLikeToggle({
      postId,
      isLiked,
      setIsLiked,
      currentLikesCount: likesCount,
      setCurrentLikesCount: setLikesCount,
      setRecentLikes,
      currentUser,
      gatewayUrl: import.meta.env.VITE_BACKEND_URL,
  });
};


  const handleClose = ()=>{
    setShouldRefresh(!shouldRefresh);
    onClose();

  }

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    console.log('New Comment:', commentText);
    setCommentText('');
  };

  const getLikeText = () => {
    if (recentLikes && recentLikes.length > 0) {
      const firstLiker = recentLikes[0];
      const otherLikesCount = likesCount - 1;
      return otherLikesCount > 0 
        ? `Liked by ${firstLiker} and ${otherLikesCount} others` 
        : `Liked by ${firstLiker}`;
    }
    return `${likesCount} likes`;
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  if (loading) return <div>Loading...</div>;
  if (!postDetails) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white w-3/4 h-5/6 p-6 rounded-lg relative overflow-hidden'>
        <button onClick={handleClose} className='absolute top-4 right-4 text-gray-600 text-xl'>
          &times;
        </button>

        <div className='flex h-full'>
          <div className='w-3/4 pr-10'>
            {postDetails.file_type && postDetails.file_type.startsWith('image') && (
              <ImageDisplay imageUrl={postDetails.file_url} />
            )}
            {postDetails.file_type && postDetails.file_type.startsWith('video') && (
              <VideoDisplay videoUrl={postDetails.file_url} />
            )}
            {postDetails.file_type && postDetails.file_type.startsWith('audio') && (
              <AudioPost 
                file_url={postDetails.file_url} 
                cover_image={postDetails.user_image || '/cover/cov1.jpg'}
              />
            )}
          </div>

          <div className='w-1/4 pl-4 flex flex-col'>
            <div className='flex items-center mb-4'>
              {postDetails.user_image ? (
                <img src={postDetails.user_image} alt='User' className='w-10 h-10 rounded-full object-cover mr-2' />
              ) : (
                <FaUserCircle className='w-10 h-10 text-gray-400 mr-2' />
              )}
              <span className='font-bold text-gray-800 text-lg'>{postDetails.user}</span>
            </div>
            <p className='mb-4 text-gray-600'>{postDetails.description}</p>

            {/* Display like text above like and share buttons */}
            <div className="mb-2">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full mr-2">
                  <span className="text-red-500 text-xs">❤️</span>
                </div>
                <span className="text-gray-700 text-sm">{getLikeText()}</span>
              </div>
            </div>

            <div className='flex items-center space-x-2 mb-4'>
              <div className='flex items-center bg-gray-400 rounded-lg px-2 py-1 cursor-pointer' onClick={handleLikeClick}>
                {isLiked ? <FaHeart className='text-red-600' /> : <FaRegHeart className='text-white' />}
              </div>
              <div className='flex items-center bg-gray-400 rounded-lg px-2 py-1'>
                <FaShareAlt className='text-white' />
                <span className='text-white ml-1'>{postDetails.shares}</span>
              </div>
              <div className='relative'>
                <FaEllipsisV 
                  onClick={toggleDropdown} 
                  className='text-gray-800 cursor-pointer' 
                />
                {dropdownVisible && (
                  <div className='absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-md z-10'>
                    <div className='p-2 cursor-pointer text-red-500 hover:bg-gray-200 flex justify-center items-center'>
                      <FaRegHeart className='inline mr-2 text-red-500' /> Block
                    </div>
                    <div className='p-2 cursor-pointer text-red-500 hover:bg-gray-200 flex justify-center items-center'>
                      <FaRegHeart className='inline mr-2 text-red-500' /> Report
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='border-t border-gray-300 mt-4 pt-2'>
              <h3 className='font-semibold mb-2'>Comments</h3>
              {postDetails.comments.map((comment) => (
                <div key={comment.id} className='mb-2 text-gray-700'>
                  <strong>{comment.user.username}:</strong> <span className='text-sm'>{comment.text}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleCommentSubmit} className='flex items-center mt-4'>
              <input
                type='text'
                placeholder='Leave a comment...'
                className='flex-1 border rounded-lg p-2 mr-2'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button 
                type='submit' 
                className='bg-blue-600 text-white rounded-lg px-4 py-2'
              >
                Post
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

}

export default PostDetailModal;