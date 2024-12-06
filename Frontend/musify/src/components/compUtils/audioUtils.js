export const createAudioBuffer = async (audioContext, sourceBuffer, start, end) => {
    const sampleRate = sourceBuffer.sampleRate;
    const channels = sourceBuffer.numberOfChannels;
    const frameCount = Math.floor((end - start) * sampleRate);
  
    const newBuffer = audioContext.createBuffer(
      channels,
      frameCount,
      sampleRate
    );
  
    for (let channel = 0; channel < channels; channel++) {
      const sourceData = sourceBuffer.getChannelData(channel);
      const newData = newBuffer.getChannelData(channel);
      const startSample = Math.floor(start * sampleRate);
      
      for (let i = 0; i < frameCount; i++) {
        newData[i] = sourceData[startSample + i];
      }
    }
  
    return newBuffer;
  };

  // Add new blob to base64 conversion utility
    export const blobToBase64 = (blob) => {
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
        });
    };
  
    export const audioBufferToBlob = async (buffer) => {
        const offlineContext = new OfflineAudioContext({
          numberOfChannels: buffer.numberOfChannels,
          length: buffer.length,
          sampleRate: buffer.sampleRate
        });
      
        const source = offlineContext.createBufferSource();
        source.buffer = buffer;
        source.connect(offlineContext.destination);
        source.start(0);
      
        const renderedBuffer = await offlineContext.startRendering();
        const wavData = encodeWAV(renderedBuffer);
        return new Blob([wavData], { type: "audio/wav" });
      };
  
  const encodeWAV = (audioBuffer) => {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    const blockAlign = numberOfChannels * bitDepth / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = audioBuffer.length * numberOfChannels * (bitDepth / 8);
    const bufferSize = 44 + dataSize;
    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);
  
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
  
    // Write WAV header
    writeString(0, 'RIFF');
    view.setUint32(4, bufferSize - 8, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);
  
    // Write audio data
    const offset = 44;
    const channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }
  
    let index = 0;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, channels[channel][i]));
        view.setInt16(offset + index, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        index += 2;
      }
    }
  
    return arrayBuffer;
  };