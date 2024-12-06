import React, { useEffect, useState, useRef, useContext } from 'react';
import { useSelector } from 'react-redux';
import axiosInstance from '../../../../axios/authInterceptor';
import ImageDisplay from './ImageDisplay';
import VideoDisplay from './VideoDisplay';
import AudioPost from './AudioPost';
import { FaUserCircle, FaHeart, FaRegHeart, FaShareAlt, FaEllipsisV, FaUserPlus, FaExclamationTriangle, FaUserTimes, FaBan, FaTrashAlt } from 'react-icons/fa';
import { handleLikeToggle } from '../../../compUtils/likeUtils';
import { handleCommentSubmit } from '../../../compUtils/commentUtils';
import CommentSection from './CommentSection';
import ReportModal from './ReportModal';
import { ProfileContext } from '../../../../context/ProfileContext';
import BlockConfirmationModal from './BlockConfirmationModal';

const StandalonePostDetail = ({ postId, onClose }) => {
    console.log('posterid ',postId)
  const [postDetails, setPostDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [recentLikes, setRecentLikes] = useState([]);
  const [currentLikesCount, setCurrentLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [commentCount, setCommentCount] = useState(0)

  const currentUser = useSelector((state) => state.auth.user);
  const { profile } = useContext(ProfileContext);
  const dropdownRef = useRef(null);
  const gatewayUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchPostDetails = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/content/post-detail/${postId}/`);
        console.log('newData',response.data)
        setPostDetails(response.data);
        setComments(response.data.comments);
        setCommentCount(response.data.comments_count)
        setIsLiked(response.data.is_liked);
        setLikesCount(response.data.likes_count);
        setCurrentLikesCount(response.data.likes_count);
        setRecentLikes(response.data.recent_likes || []);
      } catch (error) {
        console.error('Error fetching post details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostDetails();
    }
  }, [postId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLikeClick = () => {
    if (!postDetails) return;
    handleLikeToggle({
      postId: postDetails.id,
      isLiked,
      setIsLiked,
      currentLikesCount: likesCount,
      setCurrentLikesCount: setLikesCount,
      setRecentLikes,
      currentUser,
      gatewayUrl,
    });
  };

  const handleCommentSubmitWrapper = (e) => {
    e.preventDefault();
    handleCommentSubmit({
      postId: postDetails.id,
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
      if (currentLikesCount === 1) return 'Liked by you';
      if (currentLikesCount === 2) return 'Liked by you and 1 other';
      return `Liked by you and ${othersCount} others`;
    }

    if (currentLikesCount > 0) {
      if (isUserFirstLiker) {
        return `Liked by you and ${othersCount} other${othersCount === 1 ? '' : 's'}`;
      }
      if (othersCount > 0) {
        return `Liked by ${recentLikes[0]} and ${othersCount} other${othersCount === 1 ? '' : 's'}`;
      }
      return `Liked by ${recentLikes[0]}`;
    }

    return '';
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded-lg flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-gray-700 text-center">Loading post details...</p>
        </div>
      </div>
    );
  }

  if (!postDetails) return null;

  const isOwnUser = currentUser.username === postDetails.user;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-3/4 h-5/6 p-6 rounded-lg relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 text-xl">
          &times;
        </button>

        <div className="flex h-full">
          <div className="w-3/4 pr-10">
            {postDetails.file_type?.startsWith('image') && (
              <ImageDisplay imageUrl={postDetails.file_url} />
            )}
            {postDetails.file_type?.startsWith('video') && (
              <VideoDisplay videoUrl={postDetails.file_url} />
            )}
            {postDetails.file_type?.startsWith('audio') && (
              <AudioPost
                file_url={postDetails.file_url}
                cover_image={postDetails.user_image || '/cover/cov1.jpg'}
              />
            )}
          </div>

          <div className="w-2/5 pl-4 flex flex-col justify-between">
            <div className="flex flex-col">
              <div className="flex items-center mb-4">
                {postDetails.user_image ? (
                  <img src={postDetails.user_image} alt="User" className="w-10 h-10 rounded-full object-cover mr-2" />
                ) : (
                  <FaUserCircle className="w-10 h-10 text-gray-400 mr-2" />
                )}
                <span className="font-bold text-gray-800 text-lg">{postDetails.user}</span>
              </div>

              <div className="flex items-center justify-between mb-4 relative">
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
                  <FaEllipsisV
                    onClick={() => setDropdownVisible(!dropdownVisible)}
                    className="text-gray-800 cursor-pointer"
                  />

                  {dropdownVisible && (
                    <div ref={dropdownRef} className="absolute right-0 mt-2 bg-white border border-gray-300 rounded shadow-md z-20 w-40">
                      {isOwnUser ? (
                        <>
                          <div className="p-2 cursor-pointer text-blue-500 hover:bg-gray-200 flex items-center">
                            <FaShareAlt className="inline mr-2 text-blue-500" /> Share
                          </div>
                          <div className="p-2 cursor-pointer text-green-500 hover:bg-gray-200 flex items-center">
                            <FaUserCircle className="inline mr-2 text-green-500" /> Edit
                          </div>
                          <div className="p-2 cursor-pointer text-red-500 hover:bg-gray-200 flex items-center">
                            <FaTrashAlt className="inline mr-2 text-red-500" /> Delete
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 cursor-pointer text-blue-500 hover:bg-gray-200 flex items-center">
                            {isFollowed ? (
                              <>
                                <FaUserTimes className="inline mr-2 text-blue-500" /> Unfollow
                              </>
                            ) : (
                              <>
                                <FaUserPlus className="inline mr-2 text-blue-500" /> Follow
                              </>
                            )}
                          </div>
                          <div className="p-2 cursor-pointer text-red-500 hover:bg-gray-200 flex items-center" 
                               onClick={() => setShowBlockModal(true)}>
                            <FaBan className="inline mr-2 text-red-500" /> Block
                          </div>
                          <div className="p-2 cursor-pointer text-red-500 hover:bg-gray-200 flex items-center"
                               onClick={() => setShowReportModal(true)}>
                            <FaExclamationTriangle className="inline mr-2 text-red-500" /> Report
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full mr-2">
                    <span className="text-red-500 text-xs">❤️</span>
                  </div>
                  <span className="text-gray-700 text-sm">{getLikeText()}</span>
                </div>
              </div>

              <div className="border-t border-gray-300 mb-4"></div>
            </div>

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

      {showBlockModal && (
        <BlockConfirmationModal
          userId={postDetails.user_id}
          username={postDetails.user}
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          onBlockConfirm={() => {
            setIsBlocked(true);
            setShowBlockModal(false);
          }}
        />
      )}

      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          postId={postDetails.id}
          onClose={() => setShowReportModal(false)}
          userEmail={profile.email}
        />
      )}
    </div>
  );
};

export default StandalonePostDetail;