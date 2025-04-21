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
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q'; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 1
done

echo "PostgreSQL is up - continuing"

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
npm run db:push

# Create demo users if needed (separate script)
echo "Checking if we need to seed users..."
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT * FROM users LIMIT 1" > /dev/null 2>&1; then
  echo "No users found, seeding demo users..."
  node ./scripts/seed-users.js
else
  echo "Users already exist, skipping seed"
fi

echo "Database initialization completed"