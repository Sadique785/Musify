import React from 'react';
import MediaItem from './MediaItem'; // Adjust the import according to your structure

const MediaDisplay = ({ mediaData }) => {
    return (
        <div className="flex flex-wrap justify-center"> {/* Use flex to align items horizontally */}
            {mediaData.map((media) => (
                <MediaItem key={media.id} media={media} />
            ))}
        </div>
    );
};

export default MediaDisplay;
