import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment'; 
import { FaUserCircle, FaRegHeart, FaHeart, FaShareAlt, FaPlay, FaEllipsisH } from 'react-icons/fa';
import AudioPost from './AudioPost';
import ColorThief from 'colorthief';
import axiosInstance from '../../../../axios/authInterceptor';
import { useSelector } from 'react-redux';
import { handleLikeToggle } from '../../../compUtils/likeUtils';
import { handleCommentSubmit } from '../../../compUtils/commentUtils';
import PostCardDropdown from './PostCardDropdown';
import FollowButton from './FollowButton';
import { Link } from 'react-router-dom';


function PostCard({ post, imageUrl, onPostClick, followStatus, updateFollowStatus }) {
    const { file_type, file_url, description, user, updated_at, likes_count, commentsCount, id , is_liked, recent_likes, user_id, follow_status, is_same_user } = post;
    const timeAgo = moment(updated_at).fromNow();
    const [bgColor, setBgColor] = useState('rgb(0, 0, 0)');
    const [isLiked, setIsLiked] = useState(is_liked); 
    const [currentLikesCount, setCurrentLikesCount] = useState(likes_count);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);  // New state for comments
    const [commentCount, setCommentCount] = useState(commentsCount);  // For tracking comment count
    const [recentLikes, setRecentLikes] = useState(recent_likes)
    const gatewayUrl = import.meta.env.VITE_BACKEND_URL;
    const videoRef = useRef(null);
    const dropdownRef = useRef(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false); 
    


    const currentUser= useSelector((state) => state.auth.user)

    useEffect(() => {
        if (file_type.startsWith('image')) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = file_url;
            img.onload = () => {
                const colorThief = new ColorThief();
                const color = colorThief.getColor(img);
                setBgColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
            };
        }
    }, [file_url, file_type]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        function handleScroll() {
            setIsDropdownOpen(false); // Close dropdown on scroll
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('scroll', handleScroll);

    
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', handleScroll);
      }
    }, [])
    

    const handleCardClick = (e) => {
        // Prevent default behavior of video playback
        e.preventDefault();
        onPostClick(post);
    };

    const handleCommentSubmitWrapper = (e) => {
        e.preventDefault();
        handleCommentSubmit({
            postId: id,
            commentText,
            setCommentText,
            setComments,
            setCommentCount,
            gatewayUrl,
            currentUser,
        });
    };


    const handleLikeClick = () => {

        const postId = id
        handleLikeToggle({
            postId,
            isLiked,
            setIsLiked,
            currentLikesCount,
            setCurrentLikesCount,
            setRecentLikes,
            currentUser,
            gatewayUrl,
        });
    };

    
    
    const handleCommentChange = (e) => {
        setCommentText(e.target.value);
    };

    const handleDropdownToggle = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };



 
    const getLikeText = () => {
        if (isLiked) {
            if (currentLikesCount === 1) {
                return 'Liked by you';
            } else if (currentLikesCount > 1) {
                return `Liked by you and ${currentLikesCount - 1} others`;
            }
        } 
        else {
            if (recentLikes && recentLikes.length > 0) {
                const firstLiker = recentLikes[0];  
                const otherLikesCount = currentLikesCount - 1;
    
                if (firstLiker === currentUser.username) {
                    if (currentLikesCount === 1) {
                        return `${currentLikesCount} like${currentLikesCount > 1 ? 's' : ''}`;
                    } else {
                        return `Liked by you and ${otherLikesCount} others`;
                    }
                }
    
                if (otherLikesCount > 0) {
                    return `Liked by ${firstLiker} and ${otherLikesCount} others`;
                } else {
                    return `Liked by ${firstLiker}`; 
                }
            }
    
            if (currentLikesCount > 0) {
                return `${currentLikesCount} like${currentLikesCount > 1 ? 's' : ''}`;
            }
        }
    
        return '';
    };
    

    return (
        <div className="border rounded-lg p-4 mb-4" >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                    {user.profile_image ? (
                        <img
                            src={user.profile_image}
                            alt="User"
                            className="w-8 h-8 rounded-full mr-2"
                        />
                    ) : (
                        <FaUserCircle className="w-8 h-8 text-gray-400 mr-2" />
                    )}
                    <div>
                        <Link to={`/profile/${user}`}>
                        <p className="font-bold">{user}</p>
                        </Link>
                        <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                </div>

                {/* Follow button and three dots */}


                <FollowButton 
                setIsDropdownOpen={setIsDropdownOpen}
                isDropdownOpen={isDropdownOpen}
                dropdownRef={dropdownRef}
                userId={user_id}
                // followStatus={follow_status}
                followStatus={followStatus}
                isSameUser={is_same_user}
                updateFollowStatus={updateFollowStatus}              
                  />
            </div>
            {file_type.startsWith('image') ? (
                <div 
                    className="relative mb-2 bg-cover bg-center overflow-hidden rounded-lg h-[400px]" 
                    style={{ backgroundColor: bgColor }}
                    onClick={handleCardClick}
                >
                    <img
                        src={file_url}
                        alt="Content"
                        className="w-full h-full object-contain"
                    />
                </div>
            ) : file_type.startsWith('video') ? (
                <div 
                    className="relative mb-2 overflow-hidden rounded-lg h-[400px]" 
                    style={{ backgroundColor: bgColor }} 
                    onClick={handleCardClick}
                >
                    <video
                        ref={videoRef}
                        src={file_url}
                        className="w-full h-full object-cover"
                        preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <FaPlay className="text-white text-4xl" />
                    </div>
                </div>
            ) : file_type.startsWith('audio') ? (
                <div onClick={handleCardClick}>
                <AudioPost 
                    
                    file_url={file_url}
                    cover_image={user.profile_image}
                />
                </div>
            ) : (
                <p className="text-gray-500">Unsupported media type</p>
            )}

            {/* Description */}
            {description && (
                <p className="text-gray-700 mt-2">{description}</p>
            )}

        <div className="flex items-center justify-between mt-2">
            {/* Like count section */}
            <div className="flex items-center">
                <div className="flex items-center justify-center w-6 h-6 bg-gray-300 rounded-full mr-2">
                    <span className="text-red-500 text-xs">❤️</span>
                </div>
                <span className="text-gray-700 text-sm">{getLikeText()}</span>
            </div>

            {/* Like and Share buttons */}
            <div className="flex items-center space-x-4">
                <div
                    className="flex items-center justify-center bg-gray-300 rounded-full p-2 cursor-pointer"
                    onClick={handleLikeClick}
                >
                    {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart className="text-gray-800" />}
                </div>
                <div className="flex items-center justify-center bg-gray-300 rounded-full p-2">
                    <FaShareAlt className="text-gray-800" />
                </div>
            </div>
        </div>

            {/* Comments section */}
            <p onClick={handleCardClick} className="text-xs text-gray-500 mt-1 cursor-pointer">View comments</p>

            {/* Comment input section */}
            <form className="flex items-center bg-gray-200 rounded-lg mt-2 p-2" onSubmit={handleCommentSubmitWrapper}>
                <div className="flex-shrink-0">
                    {imageUrl ? (
                        <img
                            src={`${gatewayUrl}${imageUrl}`}
                            alt="User"
                            className="w-8 h-8 rounded-full"
                        />
                    ) : (
                        <FaUserCircle className="w-8 h-8 text-gray-400" />
                    )}
                </div>
                <input
                    type="text"
                    placeholder="Leave a comment..."
                    value={commentText}
                    onChange={handleCommentChange}
                    className="ml-2 bg-transparent flex-1 focus:outline-none"
                />
                <button type="submit" disabled={!commentText} className="text-blue-500 font-bold ml-2">Post</button>
            </form>

        </div>
    );
}

export default PostCard;