// audioSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { getRandomColor } from '../../../Utils/EditUtils';
import { saveAudioFile, getAudioFile, deleteAudioFile } from '../../../indexedDb/indexedDb';
import { calculatePositionForDuration } from './AudioUtils';

const savedTracks = JSON.parse(localStorage.getItem('tracks') || '[]');

const reorderTrackNumbers = (tracks) => {
  return tracks.map((track, index) => ({
    ...track,
    number: index + 1
  }));
};

// Helper to create a default segment (entire track)
const createDefaultSegment = (track) => ({
  segmentIndex: 1,
  trackId: track.id,
  startTime: 0,
  endTime: track.durationInSeconds || 0,
  position: 0 // Add default position
});

const convertDurationToSeconds = (duration) => {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

const createInitialTrack = (id, number, name, duration) => ({
  id,
  number,
  name,
  duration,
  color: getRandomColor(),
  audioFile: null,
  fileName: null,
  segments: [{
    segmentIndex: 1,
    trackId: id,
    startTime: 0,
    endTime: convertDurationToSeconds(duration),
  }]
});

const initialState = {
  tracks: reorderTrackNumbers(savedTracks.length > 0
    ? savedTracks.map(track => ({
        ...track,
        segments: Array.isArray(track.segments) ? track.segments.map(segment => ({
          ...segment,
          position: segment.position || 0 // Add default position
        })) : [createDefaultSegment(track)]
      }))
    : [
        createInitialTrack(1, 1, 'Vocal Track', '3:15'),
        createInitialTrack(2, 2, 'Guitar Track', '2:45'),
        createInitialTrack(3, 3, 'Drums Track', '3:30'),
        createInitialTrack(4, 4, 'Bass Track', '4:05'),
      ]),
  selectedTrack: null,
};

const audioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {
    addTrack: (state, action) => {
      state.tracks.push({
        ...action.payload,
        color: getRandomColor(),
      });
    },
    removeTrack: (state, action) => {
      const trackId = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === trackId);
    
      if (trackIndex !== -1) {
        const track = state.tracks[trackIndex];

        state.tracks.splice(trackIndex, 1);
        state.tracks = reorderTrackNumbers(state.tracks);
        deleteAudioFile(trackId).catch(err => {
          console.error(`Error deleting audio file for track ${trackId}:`, err);
        });
        console.log(`Track ${trackId} and associated data deleted successfully.`);
      }
    },
    
    updateTrack: (state, action) => {
      const { id, updatedData } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = { ...state.tracks[trackIndex], ...updatedData };
      }
    },
      changeTrackColor: (state, action) => {
        const { trackId, color } = action.payload;
        const track = state.tracks.find((t) => t.id === trackId);
        if (track) {
          track.color = color;
        }
      },

      setAudioFile : (state, action) => {
        const { trackId, file, fileName, duration } = action.payload;
        const track = state.tracks.find(t => t.id === trackId);
        if (track) {
          // Ensure trackId and segmentIndex are numbers
          const numericTrackId = Number(trackId);
          
          // Save the audio file with explicit segmentIndex
          saveAudioFile(numericTrackId, file, true, 1)
            .catch(err => console.error('Error saving audio file:', err));
          
          // Update track state
          track.audioFile = numericTrackId;
          track.fileName = fileName;
          track.durationInSeconds = duration;
          
          // Create initial segment
          track.segments = [{
            segmentIndex: 1,
            trackId: numericTrackId,
            startTime: 0,
            endTime: duration,
            segmentId: `${numericTrackId}_1`
          }];
        }
      },

      splitSegment: (state, action) => {
        const { trackId, segmentIndex, splitPoint, part1Data, part2Data } = action.payload;
        
        const track = state.tracks.find(t => t.id === trackId);
        
        if (!track) {
          console.error('Track not found:', trackId);
          return;
        }
        
        const segmentToSplit = track.segments.find(s => s.segmentIndex === segmentIndex);
        
        if (!segmentToSplit) {
          console.error('Segment not found:', segmentIndex);
          return;
        }
        
        // Preserve the original segment's position
        const originalPosition = segmentToSplit.position || 0;
        
        // Calculate the duration of each new segment
        const segmentDuration = segmentToSplit.endTime - segmentToSplit.startTime;
        const part1Duration = splitPoint;
        const part2Duration = segmentDuration - splitPoint;
        
        // Find max segment index
        const maxSegmentIndex = Math.max(...track.segments.map(s => s.segmentIndex));
        
        // Calculate pixel width for each segment
        const PIXELS_PER_SECOND = 50; // Adjust this to match your UI scaling
        const part1Width = part1Duration * PIXELS_PER_SECOND;
        const part2Width = part2Duration * PIXELS_PER_SECOND;
        
        // Create new segments
        const newSegment1 = {
          segmentIndex: segmentIndex,
          trackId: trackId,
          startTime: segmentToSplit.startTime,
          endTime: segmentToSplit.startTime + splitPoint,
          segmentId: `${trackId}_${segmentIndex}`,
          // Set position to the original segment's position
          position: originalPosition
        };
        
        const newSegment2 = {
          segmentIndex: maxSegmentIndex + 1,
          trackId: trackId,
          startTime: segmentToSplit.startTime + splitPoint,
          endTime: segmentToSplit.endTime,
          segmentId: `${trackId}_${maxSegmentIndex + 1}`,
          // Position the second segment right after the first segment
          position: originalPosition + part1Width
        };
        
        // Remove original segment
        track.segments = track.segments.filter(s => s.segmentIndex !== segmentIndex);
        
        // Add new segments
        track.segments.push(newSegment1, newSegment2);
        
        // Sort segments
        track.segments.sort((a, b) => a.startTime - b.startTime);
        
        // Reindex segments
        track.segments.forEach((segment, idx) => {
          segment.segmentIndex = idx + 1;
          segment.segmentId = `${trackId}_${idx + 1}`;
        });
        
        try {
          // Delete old segment audio and save new segment audio files
          deleteAudioFile(trackId, true, segmentIndex)
            .then(() => console.log('Old segment audio deleted successfully'))
            .catch(error => console.error('Error deleting old segment audio:', error));
          
          track.segments.forEach((segment, idx) => {
            const audioData = idx === 0 ? part1Data : part2Data;
            saveAudioFile(trackId, audioData, true, segment.segmentIndex)
              .then(() => console.log(`Segment ${segment.segmentIndex} audio saved successfully`))
              .catch(error => console.error(`Error saving audio for segment ${segment.segmentIndex}:`, error));
          });
          
        } catch (error) {
          console.error('Error handling audio data:', error);
        }
      },

    resetTracks: (state) => {
      state.tracks = initialState.tracks;
      localStorage.removeItem('tracks');
    },
    setSelectedTrack: (state, action) => {
      state.selectedTrack = action.payload;
    },
    addSegment: (state, action) => {
      const { trackId, segment } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (track) {
        const segmentIndex = track.segments.length + 1;
        track.segments.push({
          ...segment,
          segmentIndex,
        });
      }
    },

    updateSegment: (state, action) => {
      const { trackId, segmentIndex, updatedData } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (track) {
        const segment = track.segments.find(s => s.segmentIndex === segmentIndex);
        if (segment) {
          Object.assign(segment, updatedData);
        }
      }
    },

    updateSegmentPosition: (state, action) => {
      const { trackId, segmentIndex, position } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (track) {
        const segment = track.segments.find(s => s.segmentIndex === segmentIndex);
        if (segment) {
          segment.position = position;
        }
      }
    },

    removeSegment: (state, action) => {
      const { trackId, segmentIndex } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (track) {
        track.segments = track.segments.filter(s => s.segmentIndex !== segmentIndex);

        // If no segments are left, reset the track's audio properties
        if (track.segments.length === 0) {
          track.audioFile = null;
          track.fileName = null;
          track.durationInSeconds = 0;
          track.duration = '0:00';
          
          // Delete the audio file from IndexedDB
          deleteAudioFile(trackId).catch(err => {
            console.error(`Error deleting audio file for track ${trackId}:`, err);
          });
        }
      }
    },

  },
});

export const { addTrack, removeTrack, updateTrack,changeTrackColor, setSelectedTrack, setAudioFile, splitSegment, resetTracks, addSegment,updateSegment, updateSegmentPosition, removeSegment } = audioSlice.actions;
export const selectTracks = (state) => state.audio.tracks;
export const selectSelectedTrack = (state) => state.audio.selectedTrack;

export default audioSlice.reducer;
