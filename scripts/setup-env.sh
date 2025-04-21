#!/bin/bash
# Script to setup environment variables for either local PostgreSQL or cloud database

set -e

# Default values for local PostgreSQL
LOCAL_PGUSER="root"
LOCAL_PGPASSWORD="Resheh-2019"
LOCAL_PGDATABASE="powerplantapp"
LOCAL_PGHOST="postgres"
LOCAL_PGPORT="5432"

# Function to show usage
show_usage() {
  echo "Setup environment variables for either local PostgreSQL or cloud database"
  echo ""
  echo "Usage: $0 [OPTIONS]"
  echo ""
  echo "Options:"
  echo "  -l, --local         Setup for local PostgreSQL (default)"
  echo "  -c, --cloud URL     Setup for cloud database with provided URL"
  echo "  -h, --help          Show this help message"
  echo ""
  echo "Example:"
  echo "  $0 --local                    # Setup for local PostgreSQL"
  echo "  $0 --cloud \"postgresql://user:pass@host:port/dbname\"  # Setup for cloud database"
}

# Parse command line arguments
CLOUD_MODE=false
CLOUD_URL=""

while [ "$1" != "" ]; do
  case $1 in
    -l | --local )
      CLOUD_MODE=false
      ;;
    -c | --cloud )
      shift
      CLOUD_URL=$1
      CLOUD_MODE=true
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

# Create or update .env file
if [ -f .env ]; then
  echo "Backing up existing .env file to .env.backup"
  cp .env .env.backup
fi

# Start with basic environment settings
cat > .env << EOL
# Application Settings
NODE_ENV=development
PORT=5000

EOL

# Add database settings based on mode
if [ "$CLOUD_MODE" = true ]; then
  if [ -z "$CLOUD_URL" ]; then
    echo "Error: Cloud URL is required with --cloud option"
    exit 1
  fi
  
  echo "Setting up for cloud database"
  cat >> .env << EOL
# Database Settings (Cloud)
DATABASE_URL=$CLOUD_URL

EOL
else
  echo "Setting up for local PostgreSQL"
  cat >> .env << EOL
# Database Settings (Local PostgreSQL)
POSTGRES_USER=$LOCAL_PGUSER
POSTGRES_PASSWORD=$LOCAL_PGPASSWORD
POSTGRES_DB=$LOCAL_PGDATABASE
PGHOST=$LOCAL_PGHOST
PGPORT=$LOCAL_PGPORT
PGUSER=$LOCAL_PGUSER
PGPASSWORD=$LOCAL_PGPASSWORD
PGDATABASE=$LOCAL_PGDATABASE
DATABASE_URL=postgres://$LOCAL_PGUSER:$LOCAL_PGPASSWORD@$LOCAL_PGHOST:$LOCAL_PGPORT/$LOCAL_PGDATABASE

EOL
fi

# Add session secret
SESSION_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
cat >> .env << EOL
# Security
SESSION_SECRET=$SESSION_SECRET
EOL

echo "Environment setup complete!"
echo "Created .env file with the following configuration:"
echo "--------------------------------------------------------"
cat .env | grep -v PASSWORD | grep -v SECRET
echo "--------------------------------------------------------"
echo "Note: Sensitive values are hidden from the output above"