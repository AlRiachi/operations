#!/bin/bash
# Script to stop Docker containers

set -e

# Determine environment
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
  echo "Stopping production containers..."
  docker-compose -f docker-compose.prod.yml down
else
  echo "Stopping development containers..."
  docker-compose down
fi

echo "Docker containers stopped successfully."