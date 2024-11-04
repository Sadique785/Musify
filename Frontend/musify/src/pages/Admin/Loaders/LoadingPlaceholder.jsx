// LoadingPlaceholder.js
import React from 'react';

const LoadingPlaceholder = () => {
    const placeholderArray = Array.from({ length: 8 }); // Create an array of 8 items

    return (
        <div className="flex flex-wrap justify-center gap-4"> {/* Use flex for grid layout */}
            {placeholderArray.map((_, index) => (
                <div
                    key={index}
                    className="relative w-48 h-48 m-2 transition-transform transform hover:scale-105 hover:shadow-lg rounded-lg overflow-hidden bg-black flex items-center justify-center"
                >
                    <div className="w-full h-full bg-gray-300 animate-pulse rounded-lg"></div> {/* Placeholder for loading */}
                </div>
            ))}
        </div>
    );
};

export default LoadingPlaceholder;
