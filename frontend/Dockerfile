# ── Stage 1: Build React app ───────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (cached layer if package.json unchanged)
COPY package*.json ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Serve with Nginx ──────────────────────────────────
FROM nginx:alpine

# Copy built React files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.bak

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
