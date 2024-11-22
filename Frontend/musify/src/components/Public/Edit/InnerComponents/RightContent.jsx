import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTracks, setAudioFile } from '../../../../redux/auth/Slices/audioSlice';
import { getAudioFile } from '../../../../indexedDb/indexedDb';
import DraggableTrack from './DraggableTrack';

const RightContent = forwardRef(({ zoomLevel, onScroll }, ref) => {
  const tracks = useSelector(selectTracks);
  const contentRef = useRef(null); 
  const dispatch = useDispatch();
  const [audioData, setAudioData] = useState({});
  const [trackWidths, setTrackWidths] = useState({}); // State to store each track's width based on duration
  const [containerWidth, setContainerWidth] = useState(0);
  const [trackPositions, setTrackPositions] = useState({});
  const [segments, setSegments] = useState({}); 
  const [isCutting, setIsCutting] = useState(false); 
  const [demoData, setDemoData] = useState({});

  // Handle updating segment position
  const handleTrackPositionChange = (trackId, segmentId, newPosition) => {
    setTrackPositions((prev) => ({
      ...prev,
      [trackId]: {
        ...prev[trackId],
        [segmentId]: newPosition,
      },
    }));
  };

  // Handle uploading audio file
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
          // Pass both the file data and filename to the Redux action
          dispatch(setAudioFile({ 
            trackId, 
            file: base64String,
            fileName: file.name // Add the filename
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handleClick = (trackId, clickX, trackWidth) => {

  
    // Step 2: Calculate the total duration of the track (in seconds)
    const totalDuration = trackWidths[trackId] ? trackWidths[trackId] / (zoomLevel * 50) : 0; // Adjust as per width scaling logic
  
    // Step 3: Calculate proportion of click within the track
    const proportion = clickX / trackWidth;
  
    // Step 4: Calculate clicked duration
    const clickedDuration = proportion * totalDuration;
    console.log(`Calculated Clicked Duration: ${clickedDuration.toFixed(2)} seconds`);
  };
  
  
  
  

  // Handle C key press to toggle cutting mode
  const handleKeyPress = (e) => {
    if (e.key === 'c' || e.key === 'C') {
      setIsCutting((prev) => !prev); // Toggle cutting state on 'C' key press
    }
  };

  // Load audio files and calculate track widths
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

  // Set up event listener for the 'C' key press
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  // Initialize segments when tracks are loaded
  useEffect(() => {
    const initialSegments = {};
    tracks.forEach((track) => {
      initialSegments[track.id] = [
        {
          id: `${track.id}-segment-1`, 
          startTime: 0,
          endTime: null,
          audioFile: audioData[track.id],
          position: 0, // Initial position of the segment
        },
      ];
    });
    setSegments(initialSegments);
  }, [tracks, audioData]);

  

  // Map through the tracks and render the DraggableTrack components
  return (
    <div ref={contentRef}  className={`relative overflow-x-scroll scrollbar-hidden ${isCutting ? 'cursor-crosshair' : 'cursor-move'} `} onScroll={(e) => onScroll(e)}>
      <div style={{ width: `${containerWidth}px` }}  className="relative z-10 space-y-1 p-4">
        {tracks.map((track) => (
          <div key={track.id}>
            {audioData[track.id] ? (
              <div>
                {/* Render segments for this track */}
                {segments[track.id]?.map((segment) => (
                  <DraggableTrack
                    key={segment.id}
                    audioData={segment.audioFile}
                    trackId={track.id}
                    segment={segment}
                    trackWidth={trackWidths[track.id]}
                    color={track.color}
                    name={track.name}
                    isCutting={isCutting}
                    onPositionChange={handleTrackPositionChange}
                    demoData={demoData}
                    setDemoData={setDemoData}
                    handleClick={handleClick}
                  />
                ))}
              </div>
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
