FROM node:20-bullseye-slim as base

# Install required dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    cron \
    nano \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Make scripts executable
RUN chmod +x ./scripts/*.sh ./docker-entrypoint.sh ./wait-for-postgres.sh

# Build the application
RUN npm run build

# Production stage
FROM node:20-bullseye-slim as production

# Install required dependencies for production
RUN apt-get update && apt-get install -y \
    postgresql-client \
    cron \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy built app from base stage
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package*.json ./
COPY --from=base /app/dist ./dist
COPY --from=base /app/scripts ./scripts
COPY --from=base /app/shared ./shared
COPY --from=base /app/wait-for-postgres.sh ./
COPY --from=base /app/docker-entrypoint.sh ./

# Create uploads and backups directories
RUN mkdir -p /app/uploads /app/backups && \
    chmod -R 777 /app/uploads /app/backups

# Make scripts executable
RUN chmod +x ./scripts/*.sh ./docker-entrypoint.sh ./wait-for-postgres.sh

# Set entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]

# Default command
CMD ["npm", "start"]