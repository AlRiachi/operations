#!/bin/bash
set -e

# Wait for PostgreSQL if needed
if [ -n "$PGHOST" ] && [ -n "$PGUSER" ] && [ -f "/app/wait-for-postgres.sh" ]; then
  echo "Waiting for PostgreSQL to be ready..."
  /app/wait-for-postgres.sh
fi

# Initialize the database if needed
if [ -f "/app/scripts/init-db.sh" ]; then
  echo "Initializing database..."
  /app/scripts/init-db.sh
fi

# Start the application
echo "Starting application..."
exec "$@"