#!/bin/bash
# Script to start the Docker containers

set -e

# Default to development mode
MODE=${1:-dev}

echo "Starting Power Plant Operations Management System in $MODE mode..."

if [ "$MODE" == "prod" ] || [ "$MODE" == "production" ]; then
  echo "Running in PRODUCTION mode..."
  docker-compose -f docker-compose.prod.yml up -d
elif [ "$MODE" == "dev" ] || [ "$MODE" == "development" ]; then
  echo "Running in DEVELOPMENT mode..."
  docker-compose up
else
  echo "Invalid mode: $MODE"
  echo "Usage: ./scripts/start-docker.sh [dev|prod]"
  exit 1
fi