#!/bin/sh

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
./wait-for-postgres.sh

# Run database migrations
echo "Running database migrations..."
npm run db:push

# Start the application
echo "Starting the application..."
exec "$@"