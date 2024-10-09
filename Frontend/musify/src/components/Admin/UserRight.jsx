import React, {useState} from 'react';

function UserRight({ userData, handleBlockUser, handleMakeAdmin }) {

  
  return (
    <div className="md:w-2/3 bg-[#060E0E] p-4">
      <div className="mt-6 bg-[#1A1F1F] p-4 rounded-lg">
        <h2 className="text-lg font-semibold text-center">User Activity</h2>
        <div className="mt-2">
          <h3 className="text-sm text-center">Total Posts</h3>
          <div className="flex justify-between space-x-4">
            <div className="flex flex-col items-center w-full h-32">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">📝</span>
              </div>
              <p className="mt-1 text-2xl font-semibold">{userData.total_posts || 0}</p>
              <p className="text-sm">Total Posts</p>
            </div>
            <div className="flex flex-col items-center w-full h-32">
              <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">🚫</span>
              </div>
              <p className="mt-1 text-2xl font-semibold">{userData.blocked_posts || 0}</p>
              <p className="text-sm">Blocked Posts</p>
            </div>
            <div className="flex flex-col items-center w-full h-32">
              <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mb-2">
                <span className="text-white text-xl">🏅</span>
              </div>
              <p className="mt-1 text-2xl font-semibold">{userData.badges || 0}</p>
              <p className="text-sm">Badges</p>
            </div>
          </div>
        </div>

        {/* Stylish Buttons */}
        <div className="mt-6 flex justify-center space-x-4">
          <button
            onClick={handleBlockUser}
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 transition duration-300 ease-in-out"
          >
            {userData.is_active ? 'Block User' : 'Unblock User'  }
          </button>
          <button
            onClick={handleMakeAdmin}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
          >
            {userData.is_staff ? 'Revoke Admin' : 'Make Admin'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserRight;
