import React from 'react';
import { useSelector } from 'react-redux';
import { selectTracks } from '../../../../redux/auth/Slices/audioSlice';
import TrackItem from './TrackItem';


function MusicComponents() {
  const tracks = useSelector(selectTracks);
  
  return (
    <div className="space-y-1">
      {tracks.map((track) => (
        <TrackItem key={track.id} track={track} />
      ))}
    </div>
  );
}

export default MusicComponents;