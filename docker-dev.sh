#!/bin/bash
# Script to build and run Docker containers in development mode

set -e

echo "========================================="
echo "Power Plant Operations Management System"
echo "Development Docker Environment"
echo "========================================="

# Make sure scripts are executable
echo "Setting up permissions..."
chmod +x wait-for-postgres.sh scripts/*.sh docker-entrypoint-dev.sh

# Check if command is specified
if [ "$1" == "build" ]; then
  echo "Building Docker images..."
  docker-compose -f docker-compose.dev.yml build
  echo "Build complete! Run ./docker-dev.sh start to start the containers."
  exit 0
elif [ "$1" == "start" ]; then
  echo "Starting Docker containers in development mode..."
  docker-compose -f docker-compose.dev.yml up
  exit 0
elif [ "$1" == "stop" ]; then
  echo "Stopping Docker containers..."
  docker-compose -f docker-compose.dev.yml down
  exit 0
elif [ "$1" == "restart" ]; then
  echo "Restarting Docker containers..."
  docker-compose -f docker-compose.dev.yml down
  docker-compose -f docker-compose.dev.yml up
  exit 0
elif [ "$1" == "logs" ]; then
  echo "Showing logs..."
  docker-compose -f docker-compose.dev.yml logs -f
  exit 0
elif [ "$1" == "bash" ]; then
  echo "Opening bash shell in app container..."
  docker-compose -f docker-compose.dev.yml exec app /bin/bash
  exit 0
fi

# If no command is specified, show help
echo "Usage: ./docker-dev.sh [command]"
echo ""
echo "Available commands:"
echo "  build    - Build Docker images"
echo "  start    - Start Docker containers (with logs)"
echo "  stop     - Stop Docker containers"
echo "  restart  - Restart Docker containers"
echo "  logs     - Show logs from Docker containers"
echo "  bash     - Open a bash shell in the app container"
echo ""
echo "Example:"
echo "  ./docker-dev.sh build"
echo "  ./docker-dev.sh start"
echo ""

exit 1