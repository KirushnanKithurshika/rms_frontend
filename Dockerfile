# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# Accept and require the Vite env at build time
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "VITE_API_URL is missing" && exit 1)
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
