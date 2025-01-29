import { getAudioFile } from "../../../../../indexedDb/indexedDb";


export class AudioPublishUtils {
    constructor() {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.pixelsPerSecond = 50;
    }
  
    async createAudioBuffer(audioData) {
      const response = await fetch(audioData);
      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    }
  
    async convertTracksToMp3(tracks, trackVolumes) {
      // console.log('AudioPublishUtils: Starting conversion to MP3...');
  
      // Calculate the maximum duration of the composition
      let maxEndPosition = 0;
      tracks.forEach(track => {
        track.segments?.forEach(segment => {
          const segmentDuration = segment.endTime - segment.startTime;
          const positionInSeconds = segment.position / this.pixelsPerSecond;
          const endPositionInSeconds = positionInSeconds + segmentDuration;
          maxEndPosition = Math.max(maxEndPosition, endPositionInSeconds);
        });
      });
  
      maxEndPosition += 1; // Add 1 second buffer
  
      // Create offline context for rendering
      const offlineCtx = new OfflineAudioContext(2, Math.ceil(maxEndPosition * 44100), 44100);
  
      // Process all tracks
      const processPromises = tracks.map(async (track) => {
        if (!track.segments || track.segments.length === 0) return;
  
        const trackVolume = (trackVolumes[track.id] ?? 50) / 100;
        const gainNode = offlineCtx.createGain();
        gainNode.gain.value = trackVolume;
        gainNode.connect(offlineCtx.destination);
  
        for (const segment of track.segments) {
          const audioData = await getAudioFile(track.id, true, segment.segmentIndex);
          if (!audioData) continue;
  
          const audioBuffer = await this.createAudioBuffer(audioData);
          const source = offlineCtx.createBufferSource();
          source.buffer = audioBuffer;
  
          const positionInSeconds = segment.position / this.pixelsPerSecond;
          source.connect(gainNode);
          source.start(positionInSeconds, 0, audioBuffer.duration);
        }
      });
  
      await Promise.all(processPromises);
  
      // Render the audio
      const renderedBuffer = await offlineCtx.startRendering();
      
      // Convert to MP3 using Web Worker
      return await this.convertToMp3(renderedBuffer);
    }
  
    async convertToMp3(audioBuffer) {
      const workerBlob = new Blob([`
        importScripts('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js');
  
        self.onmessage = function(e) {
          const { channels, sampleRate, leftChannel, rightChannel } = e.data;
          
          const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 192); // Higher bitrate for better quality
          const mp3Data = [];
  
          const sampleBlockSize = 1152;
          for (let i = 0; i < leftChannel.length; i += sampleBlockSize) {
            const leftChunk = leftChannel.slice(i, i + sampleBlockSize);
            const rightChunk = rightChannel.slice(i, i + sampleBlockSize);
  
            const leftInt16 = new Int16Array(leftChunk.map(n => n * 0x8000));
            const rightInt16 = new Int16Array(rightChunk.map(n => n * 0x8000));
  
            const mp3buf = mp3encoder.encodeBuffer(leftInt16, rightInt16);
            if (mp3buf.length > 0) {
              mp3Data.push(mp3buf);
            }
          }
  
          const mp3buf = mp3encoder.flush();
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
  
          self.postMessage(new Blob(mp3Data, { type: 'audio/mp3' }));
        };
      `], { type: 'application/javascript' });
  
      const workerUrl = URL.createObjectURL(workerBlob);
      const worker = new Worker(workerUrl);
  
      return new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          URL.revokeObjectURL(workerUrl);
          worker.terminate();
          resolve(e.data);
        };
  
        worker.onerror = (error) => {
          URL.revokeObjectURL(workerUrl);
          worker.terminate();
          reject(new Error(`MP3 conversion failed: ${error.message}`));
        };
  
        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = channels > 1 ? audioBuffer.getChannelData(1) : audioBuffer.getChannelData(0);
  
        worker.postMessage({
          channels,
          sampleRate,
          leftChannel,
          rightChannel
        });
      });
    }
  }