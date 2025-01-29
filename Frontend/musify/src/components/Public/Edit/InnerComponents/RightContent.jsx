// RightContent.jsx
import React, { forwardRef, useRef, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectTracks, setAudioFile, updateSegment, updateSegmentPosition } from '../../../../redux/auth/Slices/audioSlice';
import { getAudioFile } from '../../../../indexedDb/indexedDb';
import DraggableTrack from './DraggableTrack';

const RightContent = forwardRef(({ zoomLevel, onScroll, zoomedPositions,setZoomedPositions   }, ref) => {
  const tracks = useSelector(selectTracks);
  const contentRef = useRef(null);
  const dispatch = useDispatch();
  const [audioData, setAudioData] = useState({});
  const [trackWidths, setTrackWidths] = useState({});
  const [containerWidth, setContainerWidth] = useState(0);
  // const [segmentPositions, setSegmentPositions] = useState({});
  const [isCutting, setIsCutting] = useState(false);

  const handleUploadClick = async (trackId) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'audio/*';
    
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64String = reader.result;
          const audioElement = new Audio(base64String);
          
          audioElement.onloadedmetadata = async () => {
            const durationInSeconds = audioElement.duration;
            const numericTrackId = Number(trackId);
            
            dispatch(setAudioFile({
              trackId: numericTrackId,
              file: base64String,
              fileName: file.name,
              duration: durationInSeconds,
            }));
            
            setAudioData(prev => ({
              ...prev,
              [`${numericTrackId}_1`]: base64String
            }));
          };
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handleClick = (trackId, segmentId, clickX, trackWidth) => {
    const totalDuration = trackWidths[trackId] ? trackWidths[trackId] / (zoomLevel * 50) : 0;
    const proportion = clickX / trackWidth;
    const clickedDuration = proportion * totalDuration;
  };

  // const handleSegmentDrag = (trackId, segmentId, newPosition) => {
  //   setSegmentPositions(prev => ({
  //     ...prev,
  //     [`${trackId}_${segmentId}`]: newPosition
  //   }));
  // };
  const handleSegmentDrag = (trackId, segmentIndex, newPosition) => {
    // Update Redux
    dispatch(updateSegmentPosition({
      trackId,
      segmentIndex,
      position: newPosition
    }));

    // Update local zoomed positions state
    setZoomedPositions(prev => ({
      ...prev,
      [`${trackId}_${segmentIndex}`]: newPosition
    }));
  };



  useEffect(() => {
    const loadAudioFiles = async () => {
      const loadedAudioData = {};
      const loadedTrackWidths = {};
      let maxSegmentWidth = 0;
    
      for (const track of tracks) {
        if (track.audioFile && Array.isArray(track.segments)) {
          loadedTrackWidths[track.id] = [];
          
          const sortedSegments = [...track.segments].sort((a, b) => a.startTime - b.startTime);
          
          for (const segment of sortedSegments) {
            if (segment && segment.segmentIndex) {
              try {
                const audioSrc = await getAudioFile(
                  track.id,
                  true,
                  segment.segmentIndex
                );
                
                if (audioSrc) {
                  const segmentId = `${track.id}_${segment.segmentIndex}`;
                  loadedAudioData[segmentId] = audioSrc;
                  
                  if (typeof segment.startTime === 'number' && typeof segment.endTime === 'number') {
                    const segmentDuration = segment.endTime - segment.startTime;
                    const basePPS = 50;
                    const pixelsPerSecond = basePPS * zoomLevel;
                    const segmentWidth = segmentDuration * pixelsPerSecond;
                    
                    loadedTrackWidths[track.id].push({
                      segmentIndex: segment.segmentIndex,
                      width: segmentWidth,
                    });
                    
                    // Use the maximum position + width to determine container width
                    const segmentEnd = (segment.viewPosition || segment.position || 0) + segmentWidth;
                    maxSegmentWidth = Math.max(maxSegmentWidth, segmentEnd);
                  }
                }
              } catch (error) {
                console.error(`Error loading audio for segment ${segment.segmentIndex}:`, error);
              }
            }
          }
        }
      }
      
      setAudioData(loadedAudioData);
      setTrackWidths(loadedTrackWidths);
      setContainerWidth(maxSegmentWidth + 20000);
    };
    
    loadAudioFiles();
  }, [tracks, zoomLevel]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'c' || e.key === 'C') {
        setIsCutting((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  
  return (
    <div
      ref={ref}
      className={`relative overflow-x-scroll scrollbar-hidden ${
        isCutting ? 'cursor-crosshair' : 'cursor-move'
      }`}
      onScroll={onScroll}
    >
      <div
        style={{ width: `${containerWidth}px` }}
        className="relative z-10 space-y-1 p-4"
      >
        {tracks.map((track) => (
          <div key={track.id} className="relative h-24">
            {track.audioFile ? (
              <div className="relative h-full">
                {Array.isArray(track.segments) && 
                  [...track.segments].sort((a, b) => a.startTime - b.startTime).map((segment) => {
                    const segmentId = `${track.id}_${segment.segmentIndex}`;
                    const segmentWidth = trackWidths[track.id]?.find(
                      (widthObj) => widthObj.segmentIndex === segment.segmentIndex
                    )?.width;

                    // Use zoomed position from local state
                    const currentViewPosition = zoomedPositions[segmentId] ?? (segment.viewPosition || segment.position || 0);

                    return (
                      <DraggableTrack
                        key={segmentId}
                        audioData={audioData[segmentId]}
                        trackId={track.id}
                        segment={segment}
                        trackWidth={segmentWidth || 0}
                        color={track.color}
                        name={track.name}
                        isCutting={isCutting}
                        position={segment.position || 0}
                        viewPosition={currentViewPosition}
                        onPositionChange={(newPos) => 
                          handleSegmentDrag(track.id, segment.segmentIndex, newPos)
                        }
                        trackData={track}
                        handleClick={(clickX, width) => 
                          handleClick(track.id, segment.segmentIndex, clickX, width)
                        }
                      />
                    );
                  })}
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