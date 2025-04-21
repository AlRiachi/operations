FROM node:20-alpine as build

WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:20-alpine as production

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Install PostgreSQL client for database scripts
RUN apk add --no-cache postgresql-client bash

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/client/dist ./client/dist

# Copy necessary scripts and configuration
COPY scripts/ ./scripts/
COPY wait-for-postgres.sh ./
COPY docker-entrypoint.sh ./
COPY .env.example ./.env

# Ensure scripts are executable
RUN chmod +x ./wait-for-postgres.sh ./scripts/*.sh ./docker-entrypoint.sh

# Create directories for uploads and backups
RUN mkdir -p ./uploads ./backups

# Create non-root user for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

# Expose application port
EXPOSE 5000

# Command to run the application
CMD ["node", "dist/server/index.js"]