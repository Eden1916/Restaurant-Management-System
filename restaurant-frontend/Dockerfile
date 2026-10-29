# Stage 1: build the React app
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite bakes these values into the app at build time
ARG VITE_API_URL
ARG VITE_GOOGLE_SIGN_IN
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_SIGN_IN=$VITE_GOOGLE_SIGN_IN

RUN npm run build

# Stage 2: serve the static files with nginx
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
