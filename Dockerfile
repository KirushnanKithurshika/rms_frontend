# ---------- Stage 1: Build ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first for better caching
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# >>> Accept Vite env at build time
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

# Build the Vite project (outputs to /app/dist)
RUN npm run build

# ---------- Stage 2: Serve with Nginx ----------
FROM nginx:alpine

# SPA fallback (make sure this file exists next to the Dockerfile)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
