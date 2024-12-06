import React, {useState} from 'react';
import { FiSave } from 'react-icons/fi';
import { IoMdCloudUpload } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { usePlayback } from '../../../../context/PlayBackContext';
import { AudioExporter } from '../../../compUtils/AudioExporter';
import { selectTracks } from '../../../../redux/auth/Slices/audioSlice';

function SaveButtons() {
  const { trackVolumes } = usePlayback();
  const tracks = useSelector(selectTracks);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const audioExporter = new AudioExporter();
      await audioExporter.exportTracks(tracks, trackVolumes);
    } catch (error) {
      console.error('Error exporting audio:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Save Button */}
      <button 
        className={`flex items-center gap-1 ${
          isExporting ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#292930] hover:bg-gray-600'
        } text-white px-4 py-2 rounded-full transition`}
        onClick={handleExport}
        disabled={isExporting}
      >
        <FiSave size={16} />
        <span className='text-sm font-semibold'>
          {isExporting ? 'Exporting...' : 'Save'}
        </span>
      </button>

      {/* Publish Button */}
      <button className="flex items-center gap-1 bg-[#3a3939] text-white px-4 py-2 rounded-full hover:bg-gray-700 transition">
        <IoMdCloudUpload size={16} />
        <span className='text-sm font-semibold'>Publish</span>
      </button>
    </div>
  );
}

export default SaveButtons;