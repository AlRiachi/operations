#!/bin/bash
# Script to build Docker containers

set -e

# Make scripts executable
chmod +x scripts/*.sh wait-for-postgres.sh docker-entrypoint.sh

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file from .env.example"
  cp .env.example .env
fi

echo "Building Docker images..."

# Determine environment
if [ "$1" == "prod" ] || [ "$1" == "production" ]; then
  echo "Building production images..."
  docker-compose -f docker-compose.prod.yml build
else
  echo "Building development images..."
  docker-compose build
fi

echo "Docker images built successfully!"
echo ""
echo "To run the application in development mode:"
echo "$ ./scripts/start-docker.sh"
echo ""
echo "To run the application in production mode:"
echo "$ ./scripts/start-docker.sh prod"
echo ""
echo "Database credentials:"
echo " - Username: root"
echo " - Password: Resheh-2019"
echo " - Database: powerplantapp"
echo ""
echo "Application will be available at: http://localhost:5000"