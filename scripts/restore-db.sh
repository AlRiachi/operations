#!/bin/bash
set -e

# Get the database credentials from environment variables
DB_USER=${POSTGRES_USER:-postgres}
DB_PASSWORD=${POSTGRES_PASSWORD:-postgres}
DB_NAME=${POSTGRES_DB:-powerplantapp}
DB_HOST=${POSTGRES_HOST:-postgres}

# Check if backup file is provided
if [ -z "$1" ]; then
  echo "Error: Backup file not specified"
  echo "Usage: $0 <backup_file>"
  exit 1
fi

BACKUP_FILE=$1

# Check if the backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "Restoring database from: $BACKUP_FILE"

# If it's a compressed file, uncompress it first
if [[ "$BACKUP_FILE" == *.gz ]]; then
  echo "Uncompressing backup file..."
  gunzip -c "$BACKUP_FILE" > "${BACKUP_FILE%.*}"
  BACKUP_FILE="${BACKUP_FILE%.*}"
fi

# Restore the database
echo "Dropping existing database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -c "DROP DATABASE IF EXISTS $DB_NAME;"
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -c "CREATE DATABASE $DB_NAME;"

echo "Restoring from backup..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME < $BACKUP_FILE

echo "Database restore completed successfully!"