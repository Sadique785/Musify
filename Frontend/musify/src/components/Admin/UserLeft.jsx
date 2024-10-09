// UserLeft.js
import React from 'react';

function UserLeft({ userData }) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    console.log(userData);
    

  return (
    <div className="md:w-1/3 flex flex-col items-center mr-5">
      <div className="w-32 h-32 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden mb-4">
        {userData.userImage ? (
          <img 
          src={`${backendUrl}${userData.userImage}`}
           alt="User" 
           className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="text-6xl text-gray-400">👤</div>
        )}
      </div>
      <h1 className="text-2xl font-semibold">{userData.username}</h1>

      <div className="flex justify-between space-x-4 mt-4 bg-[#1A1F1F] p-9 rounded-lg w-full">
        <div className="text-left">
          <p className="text-sm">Followers</p>
          <p className="font-semibold">{userData.followers_count}</p>
        </div>
        <div className="text-left">
          <p className="text-sm">Following</p>
          <p className="font-semibold">{userData.following_count}</p>
        </div>
        <div className="text-left">
          <p className="text-sm">Friends</p>
          <p className="font-semibold">{userData.friends_count}</p>
        </div>
      </div>

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
