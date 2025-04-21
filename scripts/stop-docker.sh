#!/bin/bash
# Script to stop Docker containers

set -e

# Default to development mode
MODE=${1:-dev}

echo "Stopping Power Plant Operations Management System containers..."

if [ "$MODE" == "prod" ] || [ "$MODE" == "production" ]; then
  echo "Stopping PRODUCTION containers..."
  docker-compose -f docker-compose.prod.yml down
elif [ "$MODE" == "dev" ] || [ "$MODE" == "development" ]; then
  echo "Stopping DEVELOPMENT containers..."
  docker-compose down
else
  echo "Invalid mode: $MODE"
  echo "Usage: ./scripts/stop-docker.sh [dev|prod]"
  exit 1
fi

echo "Docker containers stopped successfully."