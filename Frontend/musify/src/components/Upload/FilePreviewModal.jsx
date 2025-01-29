import React, { memo, useState, useCallback } from 'react';
import MediaPreview from './MediaPreview';
import getCroppedImg from '../compUtils/cropImage';
import { FaRegSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';

const FilePreviewModal = memo(function FilePreviewModal({
  file, isModalOpen, handleCloseModal, handleSaveFile, 
  isVerifying, uploadProgress, description, setDescription 
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
  }, [setDescription]);

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
    setDescription((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-3/4 max-w-lg max-h-[90vh] overflow-y-auto border border-gray-300">
        {isVerifying && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-80 p-6 shadow-xl">
              {/* Main Progress Circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="4"
                      stroke="currentColor"
                      fill="none"
                      r="46"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-blue-500 transition-all duration-500 ease-in-out"
                      strokeWidth="4"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      r="46"
                      cx="50"
                      cy="50"
                      strokeDasharray="289"
                      strokeDashoffset={289 - (uploadProgress / 100) * 289}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-blue-500">
                      {Math.round(uploadProgress)}%
                    </span>
                    <span className="text-sm text-gray-500">Uploading...</span>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {['Verifying', 'Processing', 'Saving'].map((step, index) => (
                  <div key={step} className="relative">
                    {index < 2 && (
                      <div className="absolute left-4 ml-[3px] top-7 w-[2px] h-6">
                        <div
                          className={`w-full h-full transition-colors duration-300 ${
                            uploadProgress > (index + 1) * 33 ? 'bg-blue-500' : 'bg-gray-200'
                          }`}
                        />
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <div 
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                        ${uploadProgress > (index + 1) * 33 ? 'border-blue-500 bg-blue-50' : 
                          uploadProgress > index * 33 ? 'border-blue-500 animate-pulse' : 'border-gray-200'}`}
                      >
                        {uploadProgress > (index + 1) * 33 ? (
                          <svg 
                            className="w-5 h-5 text-blue-500" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M5 13l4 4L19 7" 
                            />
                          </svg>
                        ) : (
                          <div 
                            className={`w-2 h-2 rounded-full 
                            ${uploadProgress > index * 33 ? 'bg-blue-500' : 'bg-gray-200'}`}
                          />
                        )}
                      </div>
                      <span 
                        className={`text-sm font-medium
                        ${uploadProgress > index * 33 ? 'text-gray-900' : 'text-gray-400'}`}
                      >
                        {step}
                        {uploadProgress > index * 33 && uploadProgress <= (index + 1) * 33 && (
                          <span className="animate-pulse">...</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4 text-center">Preview</h3>

        <div className="mb-4 flex flex-col justify-center">
          <MediaPreview
            file={file}
            crop={crop}
            zoom={zoom}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
          {file && file.type.startsWith('image/') && (
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
          )}
        </div>

        <div className="relative mb-4">
          <textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder="What's new?"
            className="w-full p-2 border border-gray-300 rounded-lg mb-4 resize-none"
            rows="3"
          />
          <FaRegSmile
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute bottom-8 right-3 cursor-pointer text-gray-500"
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
          {file && file.type.startsWith('image/') ? (
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
});

export default FilePreviewModal;