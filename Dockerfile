# ── Stage 1: build ────────────────────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL=/api  → RTK Query використовує відносний URL, nginx проксіює до бекенду
# VITE_SOCKET_URL=   → socket.io підключається до поточного хоста (через nginx proxy)
ARG VITE_API_URL=/api
ARG VITE_SOCKET_URL=
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL

RUN npm run build

# ── Stage 2: nginx ─────────────────────────────────────────────────────────────
FROM nginx:alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
