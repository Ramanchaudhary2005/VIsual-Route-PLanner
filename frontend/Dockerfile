# Build Stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package config
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application files
COPY . .

# Set dynamic API URL argument during build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build client production bundle
RUN npm run build

# Production Stage - Nginx
FROM nginx:stable-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
