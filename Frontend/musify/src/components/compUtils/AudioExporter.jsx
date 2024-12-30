import { getAudioFile } from "../../indexedDb/indexedDb";

export class AudioExporter {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.pixelsPerSecond = 50;
  }

  async createAudioBuffer(audioData) {
    const response = await fetch(audioData);
    const arrayBuffer = await response.arrayBuffer();
    return await this.audioContext.decodeAudioData(arrayBuffer);
  }

  async exportTracks(tracks, trackVolumes, format = 'wav') {
    console.log(`AudioExporter: Starting ${format} export...`);

    let maxEndPosition = 0;
    tracks.forEach(track => {
      track.segments?.forEach(segment => {
        const segmentDuration = segment.endTime - segment.startTime;
        const positionInSeconds = segment.position / this.pixelsPerSecond;
        const endPositionInSeconds = positionInSeconds + segmentDuration;

        if (endPositionInSeconds > maxEndPosition) {
          maxEndPosition = endPositionInSeconds;
        }
      });
    });

    maxEndPosition += 1;

    const offlineCtx = new OfflineAudioContext(2, Math.ceil(maxEndPosition * 44100), 44100);

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

    const renderedBuffer = await offlineCtx.startRendering();
    const wavData = this.audioBufferToWav(renderedBuffer);

    if (format === 'mp3') {
      const mp3Blob = await this.wavToMp3(renderedBuffer);
      this.downloadFile(mp3Blob, 'exported_audio.mp3');
    } else {
      const wavBlob = new Blob([wavData], { type: 'audio/wav' });
      this.downloadFile(wavBlob, 'exported_audio.wav');
    }
  }

  async wavToMp3(audioBuffer) {
    // Create a Web Worker to handle MP3 conversion
    const workerBlob = new Blob([`
      importScripts('https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js');

      self.onmessage = function(e) {
        const { channels, sampleRate, leftChannel, rightChannel } = e.data;
        
        // Create MP3 encoder
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
        const mp3Data = [];

        // Process samples in chunks
        const sampleBlockSize = 1152;
        for (let i = 0; i < leftChannel.length; i += sampleBlockSize) {
          const leftChunk = leftChannel.slice(i, i + sampleBlockSize);
          const rightChunk = rightChannel.slice(i, i + sampleBlockSize);

          // Convert Float32Array to Int16Array
          const leftInt16 = new Int16Array(leftChunk.map(n => n * 0x8000));
          const rightInt16 = new Int16Array(rightChunk.map(n => n * 0x8000));

          const mp3buf = mp3encoder.encodeBuffer(leftInt16, rightInt16);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        }

        // Flush the encoder
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
          mp3Data.push(mp3buf);
        }

        // Send back the MP3 data
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

      // Send audio data to worker
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

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  audioBufferToWav(audioBuffer) {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2;
    const buffer = new ArrayBuffer(44 + length);
    const view = new DataView(buffer);
    const channels = [];
    let offset = 0;
    let pos = 0;

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