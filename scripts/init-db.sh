#!/bin/bash
# Database initialization script

set -e

# Configuration
DB_HOST=${PGHOST:-postgres}
DB_PORT=${PGPORT:-5432}
DB_USER=${PGUSER:-root}
DB_PASSWORD=${PGPASSWORD:-Resheh-2019}
DB_NAME=${PGDATABASE:-powerplantapp}

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."

# Maximum number of attempts
MAX_RETRY=30
# Counter for attempts
RETRY=0

while [ $RETRY -lt $MAX_RETRY ]; do
  if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
    echo "PostgreSQL is up - continuing"
    break
  else
    echo "PostgreSQL is unavailable - sleeping (attempt $((RETRY+1))/$MAX_RETRY)"
    RETRY=$((RETRY+1))
    sleep 2
  fi
done

if [ $RETRY -eq $MAX_RETRY ]; then
  echo "Failed to connect to PostgreSQL after $MAX_RETRY attempts"
  exit 1
fi

# Check if database exists
if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
  echo "Database $DB_NAME already exists"
else
  echo "Creating database $DB_NAME..."
  PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $DB_NAME;"
  echo "Database $DB_NAME created successfully"
fi

# Push schema to database
echo "Pushing schema to database..."
if [ -f "/app/node_modules/.bin/drizzle-kit" ]; then
  # Running inside Docker container
  echo "Running drizzle-kit inside Docker container..."
  cd /app && npx drizzle-kit push:pg
else
  # Running locally
  echo "Running drizzle-kit locally..."
  npm run db:push
fi

# Create demo users if needed (separate script)
echo "Checking if we need to seed users..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM users LIMIT 1" > /dev/null 2>&1; then
  echo "No users found, seeding demo users..."
  if [ -f "/app/scripts/seed-users.js" ]; then
    # Running inside Docker container
    cd /app && node ./scripts/seed-users.js
  else
    # Running locally
    node ./scripts/seed-users.js
  fi
else
  echo "Users already exist, skipping seed"
fi

echo "Database initialization completed"