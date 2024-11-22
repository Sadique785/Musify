// audioSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { getRandomColor } from '../../../Utils/EditUtils';
import { saveAudioFile, getAudioFile, deleteAudioFile } from '../../../indexedDb/indexedDb';

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
  endTime: track.durationInSeconds || 0, // Assumes duration in seconds
});

const convertDurationToSeconds = (duration) => {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

const initialState = {
  tracks: reorderTrackNumbers(savedTracks.length > 0
    ? savedTracks
    : [
        { id: 1, number: 1, name: 'Vocal Track', duration: '3:15', color: getRandomColor(), audioFile: null, fileName: null, segments: [{ segmentIndex: 1, trackId: 1, startTime: 0, endTime: convertDurationToSeconds('3:15') }]  },
        { id: 2, number: 2, name: 'Guitar Track', duration: '2:45', color: getRandomColor(), audioFile: null, fileName: null, segments: [{ segmentIndex: 1, trackId: 1, startTime: 0, endTime: convertDurationToSeconds('2:45') }] },
        { id: 3, number: 3, name: 'Drums Track', duration: '3:30', color: getRandomColor(), audioFile: null, fileName: null, segments: [{ segmentIndex: 1, trackId: 1, startTime: 0, endTime: convertDurationToSeconds('3:30') }], },
        { id: 4, number: 4, name: 'Bass Track', duration: '4:05', color: getRandomColor(), audioFile: null, fileName: null, segments: [{ segmentIndex: 1, trackId: 1, startTime: 0, endTime: convertDurationToSeconds('4:05') }], },
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
      state.tracks = state.tracks.filter(track => track.id !== trackId);
      deleteAudioFile(trackId); 
    },
    updateTrack: (state, action) => {
      const { id, updatedData } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = { ...state.tracks[trackIndex], ...updatedData };
      }
    },
    setAudioFile: (state, action) => {
      const { trackId, file, fileName } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (track) {
        saveAudioFile(trackId, file);
        track.audioFile = trackId;
        track.fileName = fileName; // Save the filename
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
    removeSegment: (state, action) => {
      const { trackId, segmentIndex } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (track) {
        track.segments = track.segments.filter(s => s.segmentIndex !== segmentIndex);

        // If no segments are left, create a default segment
        if (track.segments.length === 0) {
          track.segments.push(createDefaultSegment(track));
        }
      }
    },

  },
});

export const { addTrack, removeTrack, updateTrack, setSelectedTrack, setAudioFile, resetTracks, addSegment,updateSegment, removeSegment } = audioSlice.actions;
export const selectTracks = (state) => state.audio.tracks;
export const selectSelectedTrack = (state) => state.audio.selectedTrack;

export default audioSlice.reducer;
