import React from 'react';

const MediaItem = ({ media }) => {
    return (
        <div className="relative w-48 h-48 m-2 transition-transform transform hover:scale-105 hover:shadow-lg rounded-lg overflow-hidden bg-black flex items-center justify-center"> {/* Added flexbox centering */}
            {media.file_type === 'image' ? (
                <img
                    src={media.file_url}
                    alt="User Media"
                    className="max-w-full max-h-full object-contain bg-black" // Ensures full image visibility
                />
            ) : media.file_type === 'audio' ? (
                <div
                    className="w-full h-full bg-cover bg-center rounded-lg"
                    style={{
                        backgroundImage: `url('/cover/cov1.jpg')`, // Replace with your cover image path
                    }}
                >
                    <audio
                        src={media.file_url}
                        controls
                        className="absolute bottom-0 w-full p-2 bg-gray-800 bg-opacity-75 rounded-b-lg"
                    />
                </div>
            ) : media.file_type === 'video' ? (
                <video
                    src={media.file_url}
                    controls
                    className="w-full h-full object-contain bg-black"
                />
            ) : (
                <p>Unsupported media type</p>
            )}
        </div>
    );
};

export default MediaItem;
