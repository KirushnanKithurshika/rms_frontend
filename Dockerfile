# Stage 1: Build the app
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY . .

# ⬇️ inject the Vite env var and fail fast if missing
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo "VITE_API_URL is missing" && exit 1)
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# If you COPY nginx.conf, make sure the file exists in the repo
# COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
