# ==============================================================================
# EduBranch AI — Frontend Web App Dockerfile (React 19 + Vite + Nginx)
# ==============================================================================

# Stage 1: Build React SPA
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy source code and config
COPY . .

# Build argument for API base URL (defaults to reverse proxy /api/v1)
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production bundle into dist/
RUN npm run build

# ==============================================================================
# Stage 2: Serve with Nginx Alpine
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend bundle from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web server port
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

