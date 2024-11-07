import React, { useEffect, useState } from 'react';
import axiosInstance from '../../../../axios/authInterceptor';
import { FaUserAlt } from 'react-icons/fa';

function RightPrivacy() {
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [loadingUser, setLoadingUser] = useState(null); 

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchBlockedUsers = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await axiosInstance.get('/friends/blocked-users/');
      console.log('Response here', response);
      
      setBlockedUsers(response.data.blocked_users || []);
    } catch (error) {
      console.error('Error fetching blocked users:', error);
      setBlockedUsers([]);
    } finally {
      setLoading(false); // Set loading to false after fetch
    }
  };

  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  const unblockUser = async (userId) => {
    setLoadingUser(userId); // Set loading for this user
    try {
      await axiosInstance.post(`/auth/block-user/`, {
        user_id: userId,
        action: 'unblock',
      });
      fetchBlockedUsers(); // Refresh the blocked users list after unblocking
    } catch (error) {
      console.error('Error unblocking user:', error);
    } finally {
      setLoadingUser(null); // Clear loading after the request
    }
  };
  

  return (
    <div className="w-2/3 p-6">
      <h2 className="text-2xl font-bold mb-4">Blocked Accounts</h2>
      <p className="text-gray-600 mb-6">
        The blocked users are no longer able to follow, message, or comment on your posts.
      </p>
  
      <div
        className={`border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto flex flex-col ${
          blockedUsers.length === 0 && !loading ? 'items-center justify-center' : ''
        }`}
      >
        {loading ? (
          <div className="w-full">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center w-full mb-4 p-2 border-b border-gray-200 animate-pulse">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : blockedUsers.length > 0 ? (
          blockedUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between w-full mb-4 p-2 border-b border-gray-200"
            >
              <div className="flex items-center">
                {user.profile_image ? (
                  <img
                    src={`${backendUrl}${user.profile_image}`}
                    alt={`${user.username}'s profile`}
                    className="w-10 h-10 bg-gray-300 rounded-full mr-4"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <FaUserAlt className="text-gray-500" />
                  </div>
                )}
                <span className="text-gray-700 font-medium">{user.username}</span>
              </div>
              <button
                className="px-4 py-2 text-base font-medium rounded-lg bg-gray-300 hover:bg-gray-400 flex items-center justify-center gap-2"
                onClick={() => unblockUser(user.id)}
                disabled={loadingUser === user.id} // Disable button while loading
              >
                {loadingUser === user.id ? (
                  <>
                  Unblocking...
                  <div className="animate-spin border-2 border-t-transparent border-gray-600 rounded-full w-5 h-5"></div>
                  
                  </>
                ) : (
                  'Unblock'
                )}
              </button>

            </div>
          ))
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <FaUserAlt className="text-gray-400 text-4xl" />
            </div>
            <p className="text-gray-500">No Blocked Users</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RightPrivacy;
