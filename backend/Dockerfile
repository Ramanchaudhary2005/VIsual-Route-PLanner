FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies (only production)
RUN npm ci --only=production

# Copy remaining backend source files
COPY . .

# Expose port and start
EXPOSE 5000
ENV PORT=5000

CMD ["npm", "start"]
