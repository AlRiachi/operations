FROM node:20-alpine

WORKDIR /app

# Install dependencies including PostgreSQL client
RUN apk add --no-cache postgresql-client bash

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Create directories for uploads and backups
RUN mkdir -p ./uploads ./backups

# Copy application code
COPY . .

# Make scripts executable
RUN chmod +x scripts/*.sh wait-for-postgres.sh

# Copy custom entrypoint script
COPY docker-entrypoint-dev.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Make sure tsx is available
RUN npm install -g tsx

# Expose port
EXPOSE 5000

# Set entrypoint
ENTRYPOINT ["/app/docker-entrypoint.sh"]