FROM node:20-slim

WORKDIR /app

# Install dependencies first so Docker can cache this layer
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the source code
COPY . .

# Folder for uploaded menu images
RUN mkdir -p uploads

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "server.js"]
