# Multi-stage Dockerfile for GharCare Unified Deployment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies for both services
RUN npm --prefix frontend install
RUN npm --prefix backend install

# Copy source code
COPY frontend ./frontend
COPY backend ./backend
COPY server.js ./

# Build both frontend and backend
RUN npm --prefix frontend run build
RUN npm --prefix backend run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4003

# Copy production artifacts
COPY package.json server.js ./
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/package*.json ./backend/
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/src/data ./backend/dist/data
COPY --from=builder /app/frontend/dist ./frontend/dist

# Expose default port (overridden by Cloud Run / Render / Railway)
EXPOSE 4003

CMD ["node", "server.js"]
