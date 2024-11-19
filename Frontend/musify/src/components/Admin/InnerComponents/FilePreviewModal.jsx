import React from 'react';
import { X } from 'lucide-react';
import AudioPreview from './AudioPreview';

const FilePreviewModal = ({ fileUrl, fileType, onClose }) => {
  if (!fileUrl || !fileType) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 relative max-h-[90vh] overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        <div className="flex justify-center items-center h-full w-full">
          {fileType === 'image' ? (
            <img
              src={fileUrl}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded"
            />
          ) : fileType === 'audio' ? (
            <div className="w-full p-3">
              <AudioPreview fileUrl={fileUrl} />
            </div>
          ) : fileType === 'video' ? (
            <video
              controls
              className="w-full max-h-[70vh] object-contain mt-4"
            >
              <source src={fileUrl} type="video/mp4" />
              Your browser does not support the video element.
            </video>
          ) : (
            <p className="text-gray-300">File preview is not available for this type.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;