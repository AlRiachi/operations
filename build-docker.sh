#!/bin/bash
# Script to build Docker containers

set -e

echo "Building Docker images..."
docker-compose build

echo "Docker images built successfully. You can now run your containers with:"
echo "docker-compose up"
echo ""
echo "For production mode, use:"
echo "docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "Database credentials:"
echo " - Username: root"
echo " - Password: Resheh-2019"
echo " - Database: powerplantapp"