#!/bin/bash
# Script to start Docker containers

set -e

# Determine environment
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
  echo "Starting application in production mode..."
  docker-compose -f docker-compose.prod.yml up -d
else
  echo "Starting application in development mode..."
  docker-compose up
fi

# Check if containers started successfully
if [ $? -eq 0 ]; then
  echo ""
  echo "Application started successfully!"
  echo "Access the web application at: http://localhost:5000"
  
  if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
    echo ""
    echo "To view logs:"
    echo "$ docker-compose -f docker-compose.prod.yml logs -f"
  fi
else
  echo "Failed to start containers. Please check the error messages above."
  exit 1
fi