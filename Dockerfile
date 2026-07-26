# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json from backend directory
COPY backend/package*.json ./

# Install dependencies
RUN npm install --production

# Copy all backend source code
COPY backend/ ./

# Expose backend port (default 5000 or Render PORT)
EXPOSE 5000

# Start server directly (migrations are already completed in Aiven DB)
CMD ["npm", "start"]
