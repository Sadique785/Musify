import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause } from 'react-icons/fa';
import WaveSurfer from 'wavesurfer.js';

function AudioPost({ file_url, cover_image }) {
    const waveformRef = useRef(null);
    const wavesurferRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [duration, setDuration] = useState(0);
    const [fileName, setFileName] = useState('');

    useEffect(() => {
        // Extract the file name from the URL
        const extractedFileName = file_url.split('/').pop();
        setFileName(extractedFileName);

        let wavesurfer = null;

        if (waveformRef.current && !wavesurferRef.current) {
            wavesurfer = WaveSurfer.create({
                container: waveformRef.current,
                waveColor: '#BF7474', // c-red
                progressColor: '#9C5E5E', // c-red-light
                barWidth: 2,
                barHeight: 1,
                responsive: true,
                normalize: true,
                fillParent: true,
                height: 80, // Adjust height for a more compact appearance
            });

            wavesurferRef.current = wavesurfer;

            wavesurfer.on('ready', () => {
                setIsLoading(false);
                setDuration(wavesurfer.getDuration()); // Get audio duration
            });

            wavesurfer.on('error', (e) => {
                console.error("Error loading audio:", e);
                setIsLoading(false);
            });

            wavesurfer.load(file_url);
        }

        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
                wavesurferRef.current = null;
            }
        };
    }, [file_url]);

    const onPlayPause = () => {
        if (wavesurferRef.current) {
            wavesurferRef.current.playPause();
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="bg-gray-200 rounded-lg p-4 flex flex-col space-y-2" style={{ minHeight: '160px' }}>
            <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                    <img
                        src={cover_image || '/cover/cov1.jpg'}
                        alt="Cover"
                        className="w-24 h-24 rounded-lg object-cover"
                    />
                </div>
                <div className="flex-1">
                    <div className="flex items-center mb-2">
                        <button onClick={onPlayPause} className="mr-4" disabled={isLoading}>
                            {isLoading ? 'Loading...' : (isPlaying ? <FaPause /> : <FaPlay />)}
                        </button>
                        <div ref={waveformRef} style={{ width: '100%' }} />
                    </div>
                </div>
            </div>
            <div className="text-sm text-gray-700 mt-2">
                <p className="font-semibold text-gray-800">File Name: <span className="text-xs font-normal">{fileName}</span></p>
                <p className="font-semibold text-gray-800">Duration: <span className="text-xs font-normal">{duration.toFixed(2)} seconds</span></p>
            </div>
        </div>
    );
}

export default AudioPost;
