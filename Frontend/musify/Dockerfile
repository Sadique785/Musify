# Build Stage
FROM node:18 AS build
WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy configuration files
COPY tailwind.config.js ./ 
COPY postcss.config.js ./
COPY vite.config.js ./
COPY index.html ./

# Copy source files
COPY src ./src
COPY public ./public

# Set production environment
ENV NODE_ENV=production

# Run build
RUN npm run build

# Production Stage
FROM node:18-alpine
WORKDIR /app

# Install serve
RUN npm install -g serve --no-cache

# Create non-root user and set permissions
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy the entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy the entire dist directory
COPY --from=build --chown=appuser:appgroup /app/dist ./dist

# Ensure correct permissions
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser
 
EXPOSE 3000

# Use the entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]