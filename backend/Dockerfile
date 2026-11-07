# ==============================================================================
# EduBranch AI — Backend Gateway Dockerfile (NestJS 10 + Node.js 20 LTS)
# ==============================================================================

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build tools required for native modules (e.g. bcrypt)
RUN apk add --no-cache python3 make g++

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy application source code and configuration
COPY . .

# Build NestJS application into dist/
RUN npm run build

# Prune devDependencies to keep runtime node_modules lightweight
RUN npm prune --production

# ==============================================================================
# Stage 2: Production runtime stage
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Install dumb-init (process supervisor for signal forwarding) and curl (healthcheck)
RUN apk add --no-cache dumb-init curl

# Copy production artifacts and migration SQL files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY migrations ./migrations

# Security hardening: run application as unprivileged node user
USER node

# Expose NestJS HTTP server port
EXPOSE 8080

# Use dumb-init as entrypoint to properly handle PID 1 signals (SIGTERM, SIGINT)
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start NestJS Gateway
CMD ["node", "dist/main"]

