// ffmpeg.worker.js
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

self.addEventListener('message', async (e) => {
  const { type, data } = e.data;
  
  if (type === 'convert') {
    try {
      // console.log('[Worker] Starting FFmpeg conversion');
      const ffmpeg = new FFmpeg();
      
      // console.log('[Worker] Loading FFmpeg');
      
      // Load FFmpeg with proper core URLs
      await ffmpeg.load({
        coreURL: await toBlobURL(
          'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js',
          'text/javascript'
        ),
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.wasm'
      });
      
      // console.log('[Worker] Writing input file');
      await ffmpeg.writeFile('input.wav', data);
      
      // console.log('[Worker] Starting conversion');
      await ffmpeg.exec(['-i', 'input.wav', '-b:a', '192k', 'output.mp3']);
      
      // console.log('[Worker] Reading output file');
      const output = await ffmpeg.readFile('output.mp3');
      
      // console.log('[Worker] Conversion complete');
      self.postMessage({ type: 'done', data: output });
    } catch (error) {
      console.error('[Worker] Error:', error);
      self.postMessage({ 
        type: 'error', 
        error: {
          message: error.message || 'FFmpeg conversion failed',
          stack: error.stack,
          name: error.name
        } 
      });
    }
  }
});