#!/bin/bash
# wait-for-postgres.sh

set -e

# Get the database credentials from environment variables
DB_HOST=${PGHOST:-postgres}
DB_PORT=${PGPORT:-5432}
DB_USER=${PGUSER:-root}
DB_PASSWORD=${PGPASSWORD:-Resheh-2019}
DB_NAME=${PGDATABASE:-powerplantapp}

echo "Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."

# Maximum number of attempts
MAX_RETRY=30
# Counter for attempts
RETRY=0

while [ $RETRY -lt $MAX_RETRY ]; do
  # Try to connect to postgres database first, then to the app database
  if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; then
    # Try to connect to the specific database
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
      echo "PostgreSQL is up - database $DB_NAME is available"
      exit 0
    else
      echo "PostgreSQL is up, but database $DB_NAME is not available yet"
    fi
  else
    echo "PostgreSQL is unavailable - sleeping (attempt $((RETRY+1))/$MAX_RETRY)"
  fi
  
  RETRY=$((RETRY+1))
  sleep 2
done

echo "Failed to connect to PostgreSQL after $MAX_RETRY attempts"
exit 1