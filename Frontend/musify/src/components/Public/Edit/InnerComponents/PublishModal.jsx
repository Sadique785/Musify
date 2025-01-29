import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaRegSmile } from 'react-icons/fa';
import { Camera } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { AudioPublishUtils } from './PublishUtils/AudioPublishUtils';
import { CloudinaryUtils } from './PublishUtils/CloudinaryUtils';
import { DatabaseUtils } from './PublishUtils/DatabaseUtils';



const PublishModal = ({ isOpen, onClose, onPublish, tracks, trackVolumes, username  }) => {
  const [projectName, setProjectName] = useState('New Project');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);


  const genres = [
    { value: 'classical', label: 'Classical' },
    { value: 'pop', label: 'Pop' },
    { value: 'rock', label: 'Rock' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'other', label: 'Other' }
  ];

  const handleEmojiSelect = (emojiData) => {
    setDescription((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPublishing(true);
    
    let cloudinaryResponse = null;
    
    try {
      // Step 1: Convert tracks to MP3
      const audioPublishUtils = new AudioPublishUtils();
      const mp3Blob = await audioPublishUtils.convertTracksToMp3(tracks, trackVolumes);
  
      // Step 2: Upload to Cloudinary
      const cloudinaryUtils = new CloudinaryUtils();
      cloudinaryResponse = await cloudinaryUtils.uploadToCloudinary(
        mp3Blob,
        projectName,
        username
      );
  
      // Step 3: Save to Database
      const databaseUtils = new DatabaseUtils();
      const folder = `musify/users/audio/${username}/`;
      
      const databaseResponse = await databaseUtils.saveProjectToDatabase({
        fileUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id,
        projectName,
        username,
        description,
        genre,
        folder
      });

  
      // Call onPublish with all the data
      onPublish({
        projectName,
        genre,
        description,
        audioUrl: cloudinaryResponse.secure_url,
        publicId: cloudinaryResponse.public_id
      });
  
    } catch (error) {
      
      // If Cloudinary upload succeeded but database save failed,
      // clean up the uploaded file from Cloudinary
      if (cloudinaryResponse?.public_id) {
        const databaseUtils = new DatabaseUtils();
        try {
          await databaseUtils.deleteFromCloudinary(cloudinaryResponse.public_id);
          console.log('Cleaned up Cloudinary file after error');
        } catch (cleanupError) {
          console.error('Error cleaning up Cloudinary file:', cleanupError);
        }
      }
      
      // Handle error appropriately (e.g., show error message to user)
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-3/4 max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-6 text-white">New Project</h2>
        
        <div className="flex gap-6">
          {/* Left side - Image preview */}
          <div className="w-1/4">
            <div className="relative aspect-square w-full bg-gray-800 rounded-lg group cursor-pointer">
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 rounded-lg">
                <Camera className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={32} />
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-3/4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Project Name */}
              <div>
                <label className="block font-medium mb-1 text-white" htmlFor="projectName">
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-gray-600"
                  required
                />
              </div>

              {/* Genre Dropdown */}
              <div>
                <label className="block font-medium mb-1 text-white" htmlFor="genre">
                  Genre
                </label>
                <select
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white focus:outline-none focus:border-gray-600"
                  required
                >
                  <option value="">Select a genre</option>
                  {genres.map(genre => (
                    <option key={genre.value} value={genre.value}>
                      {genre.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-400 mt-1">
                  Choose the right genre to attract your target audience
                </p>
              </div>

              {/* Description */}
              <div className="relative">
                <label className="block font-medium mb-1 text-white" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 border border-gray-700 rounded-lg bg-gray-800 text-white resize-none focus:outline-none focus:border-gray-600"
                  rows="4"
                />
                <FaRegSmile
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute bottom-3 right-3 cursor-pointer text-gray-400 hover:text-gray-300"
                  size={19}
                />
                {showEmojiPicker && (
                  <div className="absolute bottom-0 right-0 z-10">
                    <EmojiPicker onEmojiClick={handleEmojiSelect} theme="dark" />
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[#421b1b] text-white hover:bg-[#5c2727]"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PublishModal;