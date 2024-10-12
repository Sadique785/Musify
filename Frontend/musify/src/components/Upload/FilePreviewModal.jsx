import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../compUtils/cropImage';
import { FaRegSmile } from 'react-icons/fa'; // Import the emoji icon
import EmojiPicker from 'emoji-picker-react';

function FilePreviewModal({ file, isModalOpen, handleCloseModal, handleSaveFile, isVerifying, uploadProgress, description, setDescription }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State for controlling the emoji picker

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      const croppedImage = await getCroppedImg(URL.createObjectURL(file), croppedArea);
      handleSaveFile(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleEmojiSelect = (emojiData) => {
    setDescription((prev) => prev + emojiData.emoji); // Update description with selected emoji
    setShowEmojiPicker(false); // Hide emoji picker after selection
  };

  // Ensure the modal isn't shown when not needed
  if (!isModalOpen) return null;

  // Check the file type and ensure it's an image
  const isImage = file && file.type.startsWith('image/');

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-3/4 max-w-lg max-h-[90vh] overflow-y-auto border border-gray-300">
        {isVerifying && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
            <span className="text-white mb-2">Preparing for upload...</span>
            <progress value={uploadProgress} max="100" className="w-1/2">{uploadProgress}%</progress>
            <p className="text-white mt-2">{uploadProgress}%</p>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4 text-center">Preview</h3>

        <div className="mb-4 flex flex-col justify-center">
          {isImage ? (
            <>
              <div className="relative w-full h-[400px]"> {/* Set a fixed height for the image area */}
                <Cropper
                  image={URL.createObjectURL(file)} // Ensure image URL is correct
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  cropShape="rect"
                />
              </div>
              <div className="mt-2 text-center w-full">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(e.target.value)}
                  className="w-full mt-2"
                />
              </div>
            </>
          ) : file && file.type.startsWith('video/') ? (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="w-full h-auto max-h-[50vh] max-w-[70vw] object-contain"
            />
          ) : file && file.type.startsWith('audio/') ? (
            <audio
              src={URL.createObjectURL(file)}
              controls
              className="w-full"
            />
          ) : (
            <div className="text-center text-red-500">
              Unsupported file format
            </div>
          )}
        </div>

        {/* Add description text area and emoji icon */}
        <div className="relative mb-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's new?"
            className="w-full p-2 border border-gray-300 rounded-lg mb-4 resize-none"
            rows="3"
          />
          <FaRegSmile 
            onClick={() => setShowEmojiPicker(!showEmojiPicker)} // Toggle emoji picker
            className="absolute bottom-8 right-3 cursor-pointer text-gray-500" // Set emoji icon color to gray
            size={19}
          />
          {showEmojiPicker && (
            <div className="absolute bottom-12 right-0 z-10">
              <EmojiPicker onEmojiClick={handleEmojiSelect} />
            </div>
          )}
        </div>

        <div className="flex justify-center gap-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded-full hover:bg-gray-400"
            onClick={handleCloseModal}
          >
            Close
          </button>
          {isImage ? (
            <button
              className="bg-[#421b1b] text-white px-4 py-2 rounded-full hover:bg-[#5c2727]"
              onClick={handleCropSave}
            >
              Save Crop
            </button>
          ) : (
            <button
              className="bg-[#421b1b] text-white px-4 py-2 rounded-full hover:bg-[#5c2727]"
              onClick={() => handleSaveFile(file)}
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilePreviewModal;
