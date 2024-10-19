// UploadInput.jsx
import React from 'react';
import { FaUser, FaUpload, FaVideo } from 'react-icons/fa';

function UploadInput({
  profileImageUrl,
  onFileChange,
  onVideoClick,
  acceptTypes = 'image/*,video/*,audio/*',
}) {
  return (
    <div className="flex items-center w-full mb-6">
      <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center mr-4">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="w-full h-full object-cover transition duration-300 ease-in-out"
          />
        ) : (
          <FaUser className="text-gray-500 text-2xl" /> // Display user icon if no image
        )}
      </div>

      <div className="flex-grow relative">
        <input
          type="text"
          className="w-full px-4 py-2 bg-gray-100 rounded-full placeholder-gray-600 focus:outline-none"
          placeholder="What's new"
          readOnly
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex gap-2">
          <label htmlFor="file-upload">
            <FaUpload className="text-gray-600 h-4 w-4 cursor-pointer" />
          </label>
          <input
            id="file-upload"
            type="file"
            accept={acceptTypes}
            style={{ display: 'none' }}
            onChange={onFileChange}
          />
          <FaVideo className="text-gray-600 h-4 w-4 cursor-pointer" onClick={onVideoClick} />
        </div>
      </div>
    </div>
  );
}

export default UploadInput;
