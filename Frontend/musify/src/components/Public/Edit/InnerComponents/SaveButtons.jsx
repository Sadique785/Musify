import React, { useState, useRef, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';
import { IoMdCloudUpload } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { usePlayback } from '../../../../context/PlayBackContext';
import { AudioExporter } from '../../../compUtils/AudioExporter';
import { selectTracks } from '../../../../redux/auth/Slices/audioSlice';
import FormatDropdown from './FormatDropdown';
import PublishModal from './PublishModal';

function SaveButtons() {
  const { trackVolumes } = usePlayback();
  const tracks = useSelector(selectTracks);
  const username = useSelector((state) => state.auth.user?.username)
  const [isExporting, setIsExporting] = useState(false);
  const [showFormatDropdown, setShowFormatDropdown] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('wav');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFormatDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const audioExporter = new AudioExporter();
      await audioExporter.exportTracks(tracks, trackVolumes, selectedFormat);
      setShowFormatDropdown(false);
    } catch (error) {
      console.error('Error exporting audio:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePublish = (publishData) => {
    // Handle publish logic here
    console.log('Publishing:', publishData);
    setIsPublishModalOpen(false);
  };

  return (
<div className="flex gap-4 relative z-[200]">
  
      {/* Save Button */}
      <div className="relative">
        <button 
          className={`flex items-center gap-1 ${
            isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#292930] hover:bg-gray-600'
          } text-white px-4 py-2 rounded-full transition`}
          onClick={() => setShowFormatDropdown(!showFormatDropdown)}
          disabled={isExporting}
        >
          <FiSave size={16} />
          <span className='text-sm font-semibold'>
            {isExporting ? 'Exporting...' : 'Save'}
          </span>
        </button>

        {showFormatDropdown && (
          <FormatDropdown
            selectedFormat={selectedFormat}
            onFormatChange={setSelectedFormat}
            onExport={handleExport}
          />
        )}
      </div>

      {/* Publish Button */}
      <button
        className="flex items-center gap-1 bg-[#3a3939] text-white px-4 py-2 rounded-full hover:bg-gray-700 transition"
        onClick={() => setIsPublishModalOpen(true)}
      >
        <IoMdCloudUpload size={16} />
        <span className='text-sm font-semibold'>Publish</span>
      </button>

      {/* Publish Modal */}
      <PublishModal
        isOpen={isPublishModalOpen}
        tracks={tracks}
        trackVolumes={trackVolumes}
        onClose={() => setIsPublishModalOpen(false)}
        onPublish={handlePublish}
        username={username}
      />
    </div>
  );
}

export default SaveButtons;