import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import WaveSurfer from 'wavesurfer.js';
import { X, Play, Pause } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { 
  createAudioBuffer, 
  audioBufferToBlob, 
  blobToBase64 
} from '../../../compUtils/audioUtils';
import { splitSegment } from '../../../../redux/auth/Slices/audioSlice';



const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 min-h-screen w-screen isolate z-[9999] overflow-y-auto"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-3/4 bg-gray-900/95 rounded-lg shadow-2xl border border-gray-800">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

const AudioSplitter = ({ fileUrl, isOpen, onClose , trackData, segment}) => {
  const dispatch = useDispatch();
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const [splitPoint, setSplitPoint] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (isOpen && waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4f46e5',
        progressColor: '#818cf8',
        cursorColor: '#ef4444', // Playback cursor
        barWidth: 2,
        barHeight: 4,
        height: 200,
        normalize: true,
        partialRender: true,
        responsive: true,
      });

      wavesurferRef.current.load(fileUrl);

      wavesurferRef.current.on('ready', () => {
        setDuration(wavesurferRef.current.getDuration());
      });

      // Handle click to set the split point and create a static marker
      wavesurferRef.current.on('click', (position) => {
        const clickTime = position * wavesurferRef.current.getDuration();
        setSplitPoint(clickTime);

        // Add a fixed marker
        addStaticMarker(clickTime);
      });
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [isOpen, fileUrl]);

  // Function to add a fixed marker
  const addStaticMarker = (time) => {
    if (wavesurferRef.current) {
      wavesurferRef.current.clearMarkers(); // Clear previous markers
      wavesurferRef.current.addMarker({
        time, // Marker time in seconds
        color: '#ef4444', // Marker color
        position: 'top', // Marker position at the top of the waveform
        draggable: false, // Prevent dragging
        label: 'Split', // Optional label
      });
    }
  };

  const handlePlayPause = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  

  const handleSplit = async () => {
    if (!splitPoint) {
      alert('Please select a split point by clicking on the waveform');
      return;
    }
    try {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
      const part1 = await createAudioBuffer(audioContext, audioBuffer, 0, splitPoint);
      const part2 = await createAudioBuffer(
        audioContext,
        audioBuffer,
        splitPoint,
        audioBuffer.duration
      );
  
      const blob1 = await audioBufferToBlob(part1);
      const blob2 = await audioBufferToBlob(part2);
      
      const base64Part1 = await blobToBase64(blob1);
      const base64Part2 = await blobToBase64(blob2);
      // const segmentToSplit = trackData.segments.find(s => 
      //   splitPoint >= s.startTime && splitPoint <= s.endTime
      // );
  
      if (!segment) {
        throw new Error('Could not find segment to split');
      } 
 
      dispatch(splitSegment({
        trackId: trackData.id,
        segmentIndex: segment.segmentIndex,
        splitPoint: splitPoint - segment.startTime, // Convert to relative time
        part1Data: base64Part1,
        part2Data: base64Part2
      }));
  
      onClose();
    } catch (error) {
      alert('Error splitting the audio file. Please try again.');
    }
  };



  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          Trim Audio
        </h2>
        
        <div className="bg-gray-800/50 p-6 rounded-lg mb-6 backdrop-blur-sm border border-gray-700">
          <div ref={waveformRef} />
          {splitPoint && (
            <p className="text-gray-400 mt-2 text-center">
              Split point: {splitPoint.toFixed(2)} seconds
            </p>
          )}
        </div>

        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={handlePlayPause}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <Pause size={20} /> Pause
              </>
            ) : (
              <>
                <Play size={20} /> Play
              </>
            )}
          </button>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleSplit}
            disabled={!splitPoint}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Split Audio
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AudioSplitter;
