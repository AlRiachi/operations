#!/bin/bash
# Script to start Docker containers with appropriate configuration

set -e

# Function to show usage
show_usage() {
  echo "Start Docker containers with appropriate configuration"
  echo ""
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  -m, --mode MODE     Mode to run in: dev (default), prod"
  echo "  -d, --db TYPE       Database type: local (default), cloud"
  echo "  -h, --help          Show this help message"
  echo ""
  echo "Example:"
  echo "  $0 --mode dev --db local  # Start development environment with local PostgreSQL"
  echo "  $0 --mode prod --db cloud # Start production environment with cloud database"
}

# Default values
MODE="dev"
DB_TYPE="local"

# Parse command line arguments
while [ "$1" != "" ]; do
  case $1 in
    -m | --mode )
      shift
      MODE=$1
      ;;
    -d | --db )
      shift
      DB_TYPE=$1
      ;;
    -h | --help )
      show_usage
      exit 0
      ;;
    * )
      echo "Unknown option: $1"
      show_usage
      exit 1
      ;;
  esac
  shift
done

# Validate arguments
if [ "$MODE" != "dev" ] && [ "$MODE" != "prod" ]; then
  echo "Error: Mode must be 'dev' or 'prod'"
  exit 1
fi

if [ "$DB_TYPE" != "local" ] && [ "$DB_TYPE" != "cloud" ]; then
  echo "Error: Database type must be 'local' or 'cloud'"
  exit 1
fi

# Set the appropriate docker-compose file
if [ "$MODE" == "prod" ]; then
  COMPOSE_FILE="docker-compose.prod.yml"
else
  COMPOSE_FILE="docker-compose.yml"
fi

# Set environment variables for the database dependency
if [ "$DB_TYPE" == "cloud" ]; then
  # Check if DATABASE_URL is set
  if [ -z "$DATABASE_URL" ]; then
    if [ -f .env ]; then
      source .env
    fi
    
    if [ -z "$DATABASE_URL" ]; then
      echo "Error: DATABASE_URL environment variable is not set"
      echo "Please set DATABASE_URL or run ./scripts/setup-env.sh --cloud <URL> first"
      exit 1
    fi
  fi
  
  echo "Using cloud database: ${DATABASE_URL//:*@/:****@}"
  export DB_DEPENDENCY=""
  
  # For production mode with cloud DB, we need to exclude the postgres service
  if [ "$MODE" == "prod" ]; then
    ADDITIONAL_ARGS="--profile default"
  fi
else
  echo "Using local PostgreSQL database"
  export DB_DEPENDENCY="postgres"
  
  # For production mode with local DB, include the postgres service
  if [ "$MODE" == "prod" ]; then
    ADDITIONAL_ARGS="--profile local-db"
  fi
fi

# Build and start containers
echo "Starting containers in $MODE mode with $DB_TYPE database..."
if [ "$MODE" == "prod" ]; then
  docker-compose -f $COMPOSE_FILE build
  docker-compose -f $COMPOSE_FILE up -d $ADDITIONAL_ARGS
  
  echo "Production environment started!"
  echo "Access the application at: https://localhost (or your domain)"
else
  docker-compose -f $COMPOSE_FILE build
  docker-compose -f $COMPOSE_FILE up
fi