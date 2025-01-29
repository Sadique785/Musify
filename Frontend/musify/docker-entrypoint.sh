#!/bin/sh

# Inject environment variables into runtime config
cat <<EOF > /app/dist/config.js
window.RUNTIME_CONFIG = {
  VITE_BACKEND_URL: "${VITE_BACKEND_URL}",
  VITE_CLOUDINARY_NAME: "${VITE_CLOUDINARY_NAME}",
  VITE_CLOUDINARY_URL: "${VITE_CLOUDINARY_URL}",
  VITE_CONNECTION_URL: "${VITE_CONNECTION_URL}",
};
EOF

# Start serve
exec serve -s dist -l 3000