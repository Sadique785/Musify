import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment'; 
import { FaUserCircle, FaRegHeart, FaHeart, FaShareAlt, FaPlay } from 'react-icons/fa';
import AudioPost from './AudioPost';
import ColorThief from 'colorthief';
import axiosInstance from '../../../../axios/authInterceptor';
import { useSelector } from 'react-redux';
import { handleLikeToggle } from '../../../compUtils/likeUtils';

function PostCard({ post, imageUrl, onPostClick }) {
    const { file_type, file_url, description, user, updated_at, likes_count, commentsCount, id , is_liked, recent_likes } = post;
    const timeAgo = moment(updated_at).fromNow();
    const [bgColor, setBgColor] = useState('rgb(0, 0, 0)');
    const [isLiked, setIsLiked] = useState(is_liked); 
    const [currentLikesCount, setCurrentLikesCount] = useState(likes_count);
    const [commentText, setCommentText] = useState('');
    const [recentLikes, setRecentLikes] = useState(recent_likes)
    const gatewayUrl = import.meta.env.VITE_BACKEND_URL;
    const videoRef = useRef(null);

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

    const handleCardClick = (e) => {
        // Prevent default behavior of video playback
        e.preventDefault();
        onPostClick(post);
    };

    // const handleLikeClick = async () => {
    //     try {
    //         // Toggle isLiked state immediately for a responsive UI
    //         setIsLiked(!isLiked);
    
    //         const response = await axiosInstance.post(
    //             `${gatewayUrl}/content/posts/${id}/like/`,
    //             {},
    //             {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //             }
    //         );
    
    //         if (response.data.message === 'Post liked') {
    //             setIsLiked(true);
    //             setCurrentLikesCount(currentLikesCount + 1);
    //             // Add the current user's username to recentLikes
    //             setRecentLikes(prevLikes => [...prevLikes, currentUser.username]);
    //         } else if (response.data.message === 'Post unliked') {
    //             setIsLiked(false);
    //             setCurrentLikesCount(Math.max(currentLikesCount - 1, 0)); // Ensure the count does not go below zero
    //             // Remove the current user's username from recentLikes
    //             setRecentLikes(prevLikes => prevLikes.filter(liker => liker !== currentUser.username));
    //         }
    //     } catch (error) {
    //         console.error('Error liking post:', error);
    //     }
    // };
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

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${gatewayUrl}/content/posts/${id}/comment/`, {
                text: commentText,
            });
            if (response.status === 201) {
                
                
                setCommentText(''); 
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const getLikeText = () => {
        if (recentLikes && recentLikes.length > 0) {
            const firstLiker = recentLikes[0];
            const otherLikesCount = currentLikesCount - 1;
            return otherLikesCount > 0 
                ? `Liked by ${firstLiker} and ${otherLikesCount} others` 
                : `Liked by ${firstLiker}`;
        }
        return `${currentLikesCount} likes`;
    };





    return (
        <div className="border rounded-lg p-4 mb-4" >
            {/* User info section */}
            <div className="flex items-center mb-2" >
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
                    <p className="font-bold">{user}</p>
                    <p className="text-xs text-gray-500">{timeAgo}</p>
                </div>
            </div>

            {/* Media content section */}
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
            <p className="text-xs text-gray-500 mt-1">View {commentsCount} comments</p>

            {/* Comment input section */}
            <form className="flex items-center bg-gray-200 rounded-lg mt-2 p-2" onSubmit={handleCommentSubmit}>
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