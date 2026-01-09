# Use Node.js LTS version (Node 20+ required by @google/genai)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy application files
COPY . .

# Create uploads directory with proper permissions
RUN mkdir -p uploads && \
    chmod 755 uploads

# Expose port
EXPOSE 5000

# Start the application
ENV NODE_ENV=production
CMD ["node", "server.js"]
