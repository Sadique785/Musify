// audioSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { getRandomColor } from '../../../Utils/EditUtils';
import { saveAudioFile, getAudioFile, deleteAudioFile } from '../../../indexedDb/indexedDb';

const savedTracks = JSON.parse(localStorage.getItem('tracks') || '[]');

const initialState = {
  tracks: savedTracks.length > 0
    ? savedTracks
    : [
        { id: 1, name: 'Vocal Track', duration: '3:15', color: getRandomColor(), audioFile: null },
        { id: 2, name: 'Guitar Track', duration: '2:45', color: getRandomColor(), audioFile: null },
        { id: 3, name: 'Drums Track', duration: '3:30', color: getRandomColor(), audioFile: null },
        { id: 4, name: 'Bass Track', duration: '4:05', color: getRandomColor(), audioFile: null },
      ],
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
      deleteAudioFile(trackId); // Delete audio file from IndexedDB
    },
    updateTrack: (state, action) => {
      const { id, updatedData } = action.payload;
      const trackIndex = state.tracks.findIndex(track => track.id === id);
      if (trackIndex !== -1) {
        state.tracks[trackIndex] = { ...state.tracks[trackIndex], ...updatedData };
      }
    },
    setAudioFile: (state, action) => {
      const { trackId, file } = action.payload;
      const track = state.tracks.find(t => t.id === trackId);
      if (track) {
        saveAudioFile(trackId, file); // Save file to IndexedDB
        track.audioFile = trackId; // Store trackId as a reference
      }
    },
    resetTracks: (state) => {
      state.tracks = initialState.tracks;
      localStorage.removeItem('tracks');
    },
    setSelectedTrack: (state, action) => {
      state.selectedTrack = action.payload;
    },
  },
});

export const { addTrack, removeTrack, updateTrack, setSelectedTrack, setAudioFile, resetTracks } = audioSlice.actions;
export const selectTracks = (state) => state.audio.tracks;
export const selectSelectedTrack = (state) => state.audio.selectedTrack;

export default audioSlice.reducer;
