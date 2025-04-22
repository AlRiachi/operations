#!/bin/bash
# Script to run application in Docker development mode

set -e

# Make sure script is executable
chmod +x docker-entrypoint-dev.sh wait-for-postgres.sh

echo "==============================================="
echo "Running Power Plant App in Docker Development Mode"
echo "==============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running. Please start Docker and try again."
  exit 1
fi

# Make sure entrypoint script is executable
chmod +x docker-entrypoint-dev.sh

# Run the development environment
echo "Starting development environment..."
docker-compose -f docker-compose.dev.yml up --build