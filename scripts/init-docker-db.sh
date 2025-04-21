#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
./wait-for-postgres.sh postgres:5432 -t 60

# Run database initialization
echo "Initializing database..."
npm run db:push

echo "Database initialization complete!"