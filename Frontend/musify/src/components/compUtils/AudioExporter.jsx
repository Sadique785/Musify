// AudioExporter.js
import { getAudioFile } from "../../indexedDb/indexedDb";
export class AudioExporter {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  async createAudioBuffer(audioData) {
    const response = await fetch(audioData);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  async exportTracks(tracks, trackVolumes) {
    // Calculate total duration based on all segments
    let maxEndTime = 0;
    tracks.forEach(track => {
      track.segments?.forEach(segment => {
        if (segment.endTime > maxEndTime) {
          maxEndTime = segment.endTime;
        }
      });
    });

    // Create an offline audio context with the calculated duration
    const offlineCtx = new OfflineAudioContext(2, Math.ceil(maxEndTime * 44100), 44100);

    // Process each track
    const processPromises = tracks.map(async (track) => {
      // Skip tracks with no segments
      if (!track.segments || track.segments.length === 0) return;

      const trackVolume = (trackVolumes[track.id] ?? 50) / 100;
      const gainNode = offlineCtx.createGain();
      gainNode.gain.value = trackVolume;
      gainNode.connect(offlineCtx.destination);

      // Process each segment in the track
      for (const segment of track.segments) {
        try {
          // Get audio data from IndexedDB
          const audioData = await getAudioFile(track.id, true, segment.segmentIndex);
          if (!audioData) continue;

          // Create buffer source
          const audioBuffer = await this.createAudioBuffer(audioData);
          const source = offlineCtx.createBufferSource();
          source.buffer = audioBuffer;
          
          // Calculate segment duration and offset
          const segmentDuration = segment.endTime - segment.startTime;
          const startOffset = segment.startTime;
          
          // Connect source to gain node
          source.connect(gainNode);
          
          // Schedule the playback
          source.start(startOffset, 0, segmentDuration);
        } catch (error) {
          console.error(`Error processing segment ${segment.segmentIndex} of track ${track.id}:`, error);
        }
      }
    });

    // Wait for all tracks to be processed
    await Promise.all(processPromises);

    // Render the final audio
    const renderedBuffer = await offlineCtx.startRendering();

    // Convert to WAV format
    const wavData = this.audioBufferToWav(renderedBuffer);
    
    // Create and download the file
    const blob = new Blob([wavData], { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'exported_audio.wav';
    link.click();
    
    URL.revokeObjectURL(url);
  }

  // Helper function to convert AudioBuffer to WAV format
  audioBufferToWav(audioBuffer) {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

    // Write WAV header
    const writeString = (str) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(pos + i, str.charCodeAt(i));
      }
      pos += str.length;
    };

    const setUint16 = (data) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // WAV header structure
    writeString('RIFF');
    setUint32(36 + length);
    writeString('WAVE');
    writeString('fmt ');
    setUint32(16);
    setUint16(1);
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16);
    writeString('data');
    setUint32(length);

    // Write audio data
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    while (pos < buffer.byteLength) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return buffer;
  }
}