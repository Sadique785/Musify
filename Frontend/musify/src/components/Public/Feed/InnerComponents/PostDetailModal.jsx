import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../../axios/authInterceptor';
import ImageDisplay from './ImageDisplay';
import VideoDisplay from './VideoDisplay';
import AudioPost from './AudioPost'; // Import the AudioPost component
import { FaUserCircle, FaHeart, FaRegHeart, FaShareAlt, FaEllipsisV, FaUserPlus,FaExclamationTriangle ,FaUserTimes, FaBan  } from 'react-icons/fa';
import { handleLikeToggle } from '../../../compUtils/likeUtils';
import { handleCommentSubmit } from '../../../compUtils/commentUtils';
import CommentSection from './CommentSection';

function PostDetailModal({ post, onClose, setShouldRefresh, shouldRefresh }) {
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLiked, setIsLiked] = useState();
  const [likesCount, setLikesCount] = useState();  
  const [recentLikes, setRecentLikes] = useState(post.recent_likes);
  const [currentLikesCount, setCurrentLikesCount] = useState(post.likes_count);
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(post.comments_count); 
  const gatewayUrl = import.meta.env.VITE_BACKEND_URL;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  

  const currentUser= useSelector((state) => state.auth.user)
  const dropdownRef = useRef(null); 


  useEffect(() => {
    function handleClickOutside(event) {
      // Only close the dropdown if clicked outside of the dropdown element
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false); // Close dropdown
      }
    }
  
    // Attach the event listener on component mount
    document.addEventListener('mousedown', handleClickOutside);
  
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);
  



  useEffect(() => {
    const fetchPostDetails = async () => {
        setLoading(true);
        console.log('Fetching post details for ID:', post.id);
        try {
            const response = await axiosInstance.get(`/content/post-detail/${post.id}/`);
            console.log('Detailed Response:', response.data);
            setPostDetails(response.data);
            setComments(response.data.comments)
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


const toggleExpanded = () => {
  setIsExpanded(!isExpanded);
};




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
      gatewayUrl,
  });
};


  const handleClose = ()=>{
    setShouldRefresh(!shouldRefresh);
    onClose();

  }

  const handleBlockClick = ()=>{
    console.log('Blocked');
    
  }
  const handleFollowClick  = ()=>{
    console.log('Followed');
    
  }
  const handleReportClick   = ()=>{
    console.log('Reported');
    
  }


  const handleCommentSubmitWrapper = (e) => {
    e.preventDefault();
    handleCommentSubmit({
        postId: post.id,
        commentText,
        setCommentText,
        setComments,
        setCommentCount,
        gatewayUrl,
        currentUser,
        comments,
    });
};

const getLikeText = () => {
  const isUserFirstLiker = recentLikes.includes(currentUser.username);
  const othersCount = currentLikesCount - (isLiked ? 1 : 0) - (isUserFirstLiker ? 1 : 0);

  if (isLiked) {
      if (currentLikesCount === 1) {
          return 'Liked by you';
      } else if (currentLikesCount === 2) {
          return 'Liked by you and 1 other';
      } else {
          return `Liked by you and ${othersCount} others`;
      }
  } else {
      if (currentLikesCount > 0) {
          if (isUserFirstLiker) {
              return `Liked by you and ${othersCount} other${othersCount === 1 ? '' : 's'}`;
          } else if (othersCount > 0) {
              return `Liked by ${recentLikes[0]} and ${othersCount} other${othersCount === 1 ? '' : 's'}`;
          } else {
              return `Liked by ${recentLikes[0]}`;
          }
      }
  }

  return ''; // Return an empty string if no likes
};



const toggleDropdown = () => {
  setDropdownVisible((prevState) => !prevState); 
};


  if (loading) return <div>Loading...</div>;
  if (!postDetails) return null;




  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-3/4 h-5/6 p-6 rounded-lg relative overflow-hidden">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-600 text-xl">
          &times;
        </button>
  
        <div className="flex h-full">
          {/* Left part: Image/Video/Audio Display */}
          <div className="w-3/4 pr-10">
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
  
          {/* Right part: User info, likes, shares, comments */}
          <div className="w-2/5 pl-4 flex flex-col justify-between">
            {/* User info, likes, and shares */}
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                {postDetails.user_image ? (
                  <img src={postDetails.user_image} alt="User" className="w-10 h-10 rounded-full object-cover mr-2" />
                ) : (
                  <FaUserCircle className="w-10 h-10 text-gray-400 mr-2" />
                )}
                <span className="font-bold text-gray-800 text-lg">{postDetails.user}</span>
              </div>
  
            {/* Like, share, options */}
            <div className="flex items-center justify-between mb-4 relative"> {/* Add 'relative' here */}
              <div className="flex items-center space-x-2">
                <div
                  className="flex items-center bg-gray-400 rounded-lg px-2 py-1 cursor-pointer"
                  onClick={handleLikeClick}
                >
                  {isLiked ? <FaHeart className="text-red-600" /> : <FaRegHeart className="text-white" />}
                  </div>
                  <div className="flex items-center bg-gray-400 rounded-lg px-2 py-1">
                  <FaShareAlt className="text-white" />
                  <span className="text-white ml-1">{postDetails.shares}</span>
                </div>
                </div>
                <div className="relative overflow-visible">
                  <FaEllipsisV onClick={toggleDropdown} className="text-gray-800 cursor-pointer" />

                  {dropdownVisible && (
                    <div ref={dropdownRef} className='absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-md z-20'>
                      {/* Dropdown Content */}
                      <div className='p-2 cursor-pointer text-blue-500 hover:bg-gray-200 flex justify-center items-center'
                          onClick={handleFollowClick}>
                        {isFollowed ? (
                          <>
                            <FaUserTimes className='inline mr-2 text-blue-500' /> Unfollow
                          </>
                        ) : (
                          <>
                            <FaUserPlus className='inline mr-2 text-blue-500' /> Follow
                          </>
                        )}
                      </div>

                      <div className='p-2 cursor-pointer text-red-500 hover:bg-gray-200 flex justify-center items-center'
                          onClick={handleBlockClick}>
                        <FaBan className='inline mr-2 text-red-500' /> Block
                      </div>

                      <div className='p-2 cursor-pointer text-red-500 hover:bg-gray-200 flex justify-center items-center'
                          onClick={handleReportClick}>
                        <FaExclamationTriangle className='inline mr-2 text-red-500' /> Report
                      </div>
                    </div>
                  )}
                </div>

              </div>

  
              {/* Liked by text */}
              <div className="mb-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full mr-2">
                    <span className="text-red-500 text-xs">❤️</span>
                  </div>
                  <span className="text-gray-700 text-sm">{getLikeText()}</span>
                </div>
              </div>
  
              {/* Gray border */}
              <div className="border-t border-gray-300 mb-4"></div>
            </div>
  
            {/* Comments Section */}
            <div className="flex-grow h-0 overflow-y-auto overflow-hidden no-scrollbar">
              <CommentSection
                currentUser={currentUser}
                comments={comments}
                description={postDetails.description}
                commentText={commentText}
                setCommentText={setCommentText}
                handleCommentSubmit={handleCommentSubmitWrapper}
                userImage={postDetails.user_image}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  


}

export default PostDetailModal;