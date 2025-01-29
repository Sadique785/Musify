// src/config.js
export const getConfig = () => {
    if (window.RUNTIME_CONFIG) {
      return {
        backendUrl: window.RUNTIME_CONFIG.VITE_BACKEND_URL || import.meta.env.VITE_BACKEND_URL,
        cloudinaryName: window.RUNTIME_CONFIG.VITE_CLOUDINARY_NAME || import.meta.env.VITE_CLOUDINARY_NAME,
        cloudinaryUrl: window.RUNTIME_CONFIG.VITE_CLOUDINARY_URL || import.meta.env.VITE_CLOUDINARY_URL,
        connectionUrl: window.RUNTIME_CONFIG.VITE_CONNECTION_URL || import.meta.env.VITE_CONNECTION_URL,
      };
    }
    
    return {
      backendUrl: import.meta.env.VITE_BACKEND_URL,
      cloudinaryName: import.meta.env.VITE_CLOUDINARY_NAME,
      cloudinaryUrl: import.meta.env.VITE_CLOUDINARY_URL,
      connectionUrl: import.meta.env.VITE_CONNECTION_URL,

    };
  };