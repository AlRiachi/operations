FROM node:20-slim

# Install PostgreSQL client for health checks
RUN apt-get update && apt-get install -y postgresql-client bash

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Make our scripts executable
RUN chmod +x docker-entrypoint.sh wait-for-postgres.sh

# Build the application (if needed)
RUN npm run build --if-present

# Expose the application port
EXPOSE 5000

# Set up entrypoint and command
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]