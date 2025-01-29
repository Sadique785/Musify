// UserLeft.js
import React from 'react';
import { getBackendUrl } from '../../services/config';
import { FaUser} from 'react-icons/fa'; 



function UserLeft({ userData }) {
    const backendUrl = getBackendUrl();
    // console.log('User data:', userData);

    return (
        <div className="md:w-1/3 flex flex-col items-center mr-5">
        {/* Profile Picture */}
        <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mb-4">
            {userData.userImage && userData.userImage.trim() && userData.userImage !== '/media/profile_pics/default.png' ? (
                <img
                    src={userData.userImage}
                    alt="User"
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = ''; // Fallback to the default icon
                    }}
                />
            ) : (
                // Default user icon when no image is available or default path is sent
                <FaUser className="text-6xl text-gray-400" />
            )}
        </div>

            {/* Username */}
            <h1 className="text-2xl font-semibold">{userData.username}</h1>

            {/* User Stats */}
            <div className="flex justify-between space-x-4 mt-4 bg-[#1A1F1F] p-9 rounded-lg w-full">
                <div className="text-left">
                    <p className="text-sm">Followers</p>
                    <p className="font-semibold">{userData.followers_count || 0}</p>
                </div>
                <div className="text-left">
                    <p className="text-sm">Following</p>
                    <p className="font-semibold">{userData.following_count || 0}</p>
                </div>
                <div className="text-left">
                    <p className="text-sm">Friends</p>
                    <p className="font-semibold">{userData.friends_count || 0}</p>
                </div>
            </div>

            {/* User Details */}
            <div className="mt-2 bg-[#1A1F1F] p-4 rounded-lg w-full">
                <div className="flex flex-col space-y-2 items-center">
                    <div className="flex w-2/3 justify-between">
                        <p><strong>Is Active:</strong></p>
                        <p>{userData.is_active ? 'True' : 'False'}</p>
                    </div>
                    <div className="flex w-2/3 justify-between">
                        <p><strong>Is Staff:</strong></p>
                        <p>{userData.is_staff ? 'True' : 'False'}</p>
                    </div>
                    <div className="flex w-2/3 justify-between">
                        <p><strong>Is Online:</strong></p>
                        <p>{userData.is_online ? 'True' : 'False'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserLeft;
