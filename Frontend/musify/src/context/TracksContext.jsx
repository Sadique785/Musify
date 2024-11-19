import React, { createContext, useState } from 'react';

export const TracksContext = createContext();

export function TracksProvider({ children }) {
  const [tracks, setTracks] = useState([
    { id: 1, name: 'Vocal Track', color: 'bg-c-red-light' },
    { id: 2, name: 'Guitar Track', color: 'bg-c-red' },
  ]);

  const addTrack = (track) => {
    setTracks((prevTracks) => [...prevTracks, track]);
  };

  const updateTrack = (id, updatedTrack) => {
    setTracks((prevTracks) =>
      prevTracks.map((track) => (track.id === id ? { ...track, ...updatedTrack } : track))
    );
  };

  return (
    <TracksContext.Provider value={{ tracks, addTrack, updateTrack }}>
      {children}
    </TracksContext.Provider>
  );
};

