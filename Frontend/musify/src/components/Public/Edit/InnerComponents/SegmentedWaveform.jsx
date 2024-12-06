import React, { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from 'wavesurfer.js/plugins/regions';
import { useDispatch } from 'react-redux';
import { updateSegment, addSegment } from './audioSlice';
import { updateSegment, } from '../../../../redux/auth/Slices/audioSlice';

const SegmentedWaveform = ({ 
  trackId, 
  audioData, 
  segments, 
  color,
  isCutting,
  trackWidth,
  name 
}) => {
  const waveformRef = useRef(null);
  const wavesurferRef = useRef(null);
  const regionsRef = useRef({});
  const dispatch = useDispatch();
  const [isReady, setIsReady] = useState(false);

  // Initialize WaveSurfer
  useEffect(() => {
    if (!wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: color || '#BF7474',
        progressColor: '#9C5E5E',
        barWidth: 2,
        height: 80,
        normalize: true,
        interact: false,
        plugins: [RegionsPlugin.create()]
      });

      wavesurferRef.current.load(audioData);

      wavesurferRef.current.on('ready', () => {
        setIsReady(true);
        renderRegions();
      });

      // Handle clicks for splitting
      waveformRef.current.addEventListener('click', handleWaveformClick);
    }

    return () => {
      if (wavesurferRef.current) {
        waveformRef.current?.removeEventListener('click', handleWaveformClick);
        wavesurferRef.current.destroy();
      }
    };
  }, [audioData, color]);

  // Render regions based on segments
  const renderRegions = () => {
    if (!wavesurferRef.current || !isReady) return;

    // Clear existing regions
    Object.values(regionsRef.current).forEach(region => region.remove());
    regionsRef.current = {};

    // Create regions for each segment
    segments.forEach(segment => {
      const region = wavesurferRef.current.addRegion({
        id: `${trackId}-${segment.segmentIndex}`,
        start: segment.startTime,
        end: segment.endTime,
        color: `${color}33`, // Add transparency to color
        drag: false,
        resize: true
      });

      // Handle region updates
      region.on('update-end', () => {
        dispatch(updateSegment({
          trackId,
          segmentIndex: segment.segmentIndex,
          updatedData: {
            startTime: region.start,
            endTime: region.end
          }
        }));
      });

      regionsRef.current[segment.segmentIndex] = region;
    });
  };

  // Handle splitting at click position
  const handleWaveformClick = (e) => {
    if (!isCutting || !wavesurferRef.current || !isReady) return;

    const waveformRect = waveformRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - waveformRect.left) / waveformRect.width;
    const clickTime = clickPosition * wavesurferRef.current.getDuration();

    // Find the segment to split
    const segmentToSplit = segments.find(segment => 
      clickTime >= segment.startTime && clickTime <= segment.endTime
    );

    if (segmentToSplit) {
      // Update existing segment to end at click position
      dispatch(updateSegment({
        trackId,
        segmentIndex: segmentToSplit.segmentIndex,
        updatedData: {
          endTime: clickTime
        }
      }));

      // Create new segment from click position to original end
      dispatch(addSegment({
        trackId,
        segment: {
          startTime: clickTime,
          endTime: segmentToSplit.endTime,
          trackId
        }
      }));
    }
  };

  // Update regions when segments change
  useEffect(() => {
    renderRegions();
  }, [segments, isReady]);

  return (
    <div className="relative group h-24 rounded-lg">
      <div
        style={{
          backgroundColor: color,
          opacity: 0.3,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '0.5rem',
          pointerEvents: 'none',
        }}
      />
      <div className="relative z-10 p-4">
        <div ref={waveformRef} style={{ width: '100%' }} />
        <div className="absolute left-4 top-4 text-sm text-gray-300">{name}</div>
      </div>
    </div>
  );
};

export default SegmentedWaveform;