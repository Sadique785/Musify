import React, { memo } from 'react';
import Cropper from 'react-easy-crop';

function MediaPreview({ file, crop, zoom, onCropChange, onZoomChange, onCropComplete }) {
  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');
  const isAudio = file.type.startsWith('audio/');

  if (isImage) {
    return (
      <div className="relative w-full h-[400px]">
        <Cropper
          image={URL.createObjectURL(file)}
          crop={crop}
          zoom={zoom}
          aspect={4 / 4}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
          cropShape="rect"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <video
        src={URL.createObjectURL(file)}
        controls
        className="w-full h-auto max-h-[50vh] max-w-[70vw] object-contain"
      />
    );
  }

  if (isAudio) {
    return (
      <audio
        src={URL.createObjectURL(file)}
        controls
        className="w-full"
      />
    );
  }

  return <div className="text-center text-red-500">Unsupported file format</div>;
}

export default memo(MediaPreview);
