import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import { FaHeart, FaComment } from 'react-icons/fa';
import AudioPlayer from '../../components/Public/Track/AudioPlayer';
import axiosInstance from '../../axios/axios';
import { ProfileContext } from '../../context/ProfileContext';



const Track = () => {
  const { profile } = useContext(ProfileContext);
  console.log('profile',profile);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [trackData, setTrackData] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchTrackDetails = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/content/post-detail/${id}/`);
        console.log('Track Details Response:', response.data);
        setTrackData(response.data);
        setComments(response.data.comments);
        setIsLiked(response.data.is_liked);
        setLikesCount(response.data.likes_count);
      } catch (error) {
        console.error('Error fetching track details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTrackDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getLikeText = () => {
    if (!trackData) return '';
    if (trackData.likes_count === 0) return '';
    if (trackData.likes_count === 1) return `Liked by ${trackData.recent_likes[0]}`;
    return `Liked by ${trackData.recent_likes[0]} and ${trackData.likes_count - 1} others`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!trackData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Track not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Track Player Section */}
        <div className="bg-gradient-to-b from-gray-300 to-gray-500 feed-container rounded-xl p-6 shadow-lg mb-6">
          <div className="flex space-x-8">
          <div className="w-64 h-64 relative rounded-lg overflow-hidden bg-gray-500">
                {profile.imageUrl ? (
                    <img
                    src={`${backendUrl}${profile.imageUrl}`}
                    alt="Profile"
                    className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-500 text-gray-100">
                    <UserIcon className="w-16 h-16" /> {/* Replace `UserIcon` with the appropriate user icon component */}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-600" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-16 h-16 flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white rounded-full transition-colors shadow-md">
                    <Play className="w-8 h-8 ml-1" />
                    </button>
                </div>
                </div>


            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{trackData.title}</h1>
                  <p className="text-gray-600">{trackData.user}</p>
                </div>
                <span className="text-gray-600 text-sm">
                  {formatDate(trackData.created_at)}
                </span>
              </div>

              <AudioPlayer audioUrl={trackData.file_url} title={trackData.title} />
            </div>
          </div>
        </div>

        {/* Social Elements Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Social Stats */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <FaHeart className={`${isLiked ? 'text-red-500' : 'text-gray-600'}`} />
              <span className="text-gray-600">{likesCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <FaComment className="text-gray-600" />
              <span className="text-gray-600">{comments.length}</span>
            </div>
          </div>

          {/* Likes Text */}
          <div className="mb-4">
            <span className="text-gray-600 text-sm">{getLikeText()}</span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700">{trackData.description}</p>
          </div>

          {/* Comments Section */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-gray-700 font-semibold mb-2">Comments</h3>
            <div className="text-gray-600 text-sm">
              View all {comments.length} comments
            </div>
            {/* You could map through comments here if you want to show some preview */}
            {comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="mt-2">
                <span className="font-semibold">{comment.user}</span>
                <span className="ml-2">{comment.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Track;