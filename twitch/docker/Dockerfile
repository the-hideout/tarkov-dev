# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY bot/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY bot/src ./src
COPY bot/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the bot
CMD ["npm", "start"] 