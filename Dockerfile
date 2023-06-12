# Use an official Node.js image as the base image
FROM node:16.16.0-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY . /app

# Install dependencies
RUN npm install

# Build the Node.js application
RUN npm run build

# Expose any necessary ports
EXPOSE 5000

# Start the application with pm2
CMD node  --max-old-space-size=8192 dist/main.js