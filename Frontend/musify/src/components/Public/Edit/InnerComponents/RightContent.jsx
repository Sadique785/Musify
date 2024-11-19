// RightContent.js
import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTracks, setAudioFile } from '../../../../redux/auth/Slices/audioSlice';
import WaveformTrack from './WaveformTrack';
import { getAudioFile } from '../../../../indexedDb/indexedDb';
import DraggableTrack from './DraggableTrack';

const RightContent = forwardRef(({ zoomLevel, onScroll}, ref) => {
  
  const tracks = useSelector(selectTracks);
  const contentRef = useRef(null); 
  const dispatch = useDispatch();
  const [audioData, setAudioData] = useState({});
  const [trackWidths, setTrackWidths] = useState({}); // State to store each track's width based on duration
  const [containerWidth, setContainerWidth] = useState(0);
  const [trackPositions, setTrackPositions] = useState({});


  const handleTrackPositionChange = (trackId, newPosition) => {
    setTrackPositions(prev => ({
      ...prev,
      [trackId]: newPosition
    }));
  };


  const handleUploadClick = (trackId) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result;
          dispatch(setAudioFile({ trackId, file: base64String }));
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  useEffect(() => {
    const loadAudioFiles = async () => {
      const loadedAudioData = {};
      const loadedTrackWidths = {};
      let totalWidth = 0;



      for (const track of tracks) {
        if (track.audioFile) {
          // Retrieve audio file and duration
          const audioSrc = await getAudioFile(track.id);
          loadedAudioData[track.id] = audioSrc;

          // Calculate duration
          const audioElement = new Audio(audioSrc);
          await new Promise((resolve) => {
            audioElement.onloadedmetadata = () => {
              const duration = audioElement.duration;
              const trackWidth = duration * 100 * zoomLevel; // Adjust multiplier for scaling

              // Calculate width based on duration and zoom level
              loadedTrackWidths[track.id] = duration * 50 * zoomLevel; // adjust multiplier (50) for desired width scaling
              totalWidth += trackWidth;
              resolve();
            };
          });
        }
      }
      setAudioData(loadedAudioData);
      setTrackWidths(loadedTrackWidths);
      setContainerWidth(totalWidth + 200);
    };
    loadAudioFiles();
  }, [tracks, zoomLevel]);

  useEffect(() => {
    if (ref) {
      ref.current = contentRef.current;
    }
  }, [ref]);

  return (
    <div ref={contentRef} className="relative overflow-x-scroll  scrollbar-hidden"   onScroll={onScroll}>
      <div  
      style={{ width: `${containerWidth}px` }}
      className="relative z-10 space-y-1 p-4" >
       {tracks.map((track) => (
          <div key={track.id}>
            {audioData[track.id] ? (
              <DraggableTrack
                trackId={track.id}
                audioData={audioData[track.id]}
                trackWidth={trackWidths[track.id]}
                color={track.color}
                name={track.name}
                onPositionChange={handleTrackPositionChange}
              />
            ) : (
              <div
                className="h-24 flex w-[1210px] justify-center items-center border-2 border-gray-400 rounded-lg cursor-pointer"
                style={{ borderStyle: 'dashed' }}
                onClick={() => handleUploadClick(track.id)}
              >
                <p className="text-gray-400 text-center">Click here to upload audio</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default RightContent;
