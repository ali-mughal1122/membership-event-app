# ==============================================================================
# Multi-Stage Production Dockerfile for Angular Frontend
# Supports build argument: CONFIGURATION (default: production, can be staging)
# ==============================================================================

# Stage 1: Build Angular application
FROM node:20-alpine AS builder

WORKDIR /app

ARG CONFIGURATION=production

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration ${CONFIGURATION}

# Stage 2: High Performance Nginx Static Server
FROM nginx:alpine AS runner

# Remove default nginx boilerplate html
RUN rm -rf /usr/share/nginx/html/*

# Copy compiled Angular distribution
COPY --from=builder /app/dist/membership-event-app/browser /usr/share/nginx/html

# Copy custom Nginx configuration with SPA routing fallback
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=20s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
