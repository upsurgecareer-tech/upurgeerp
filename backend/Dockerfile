# Use official Node.js LTS image
FROM node:18-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all backend source code
COPY . ./

# Expose backend port
EXPOSE 5000

# Start server directly (migrations are already completed in Aiven DB)
CMD ["npm", "start"]
