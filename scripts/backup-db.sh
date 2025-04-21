#!/bin/bash
set -e

# Get the database credentials from environment variables
DB_USER=${POSTGRES_USER:-postgres}
DB_PASSWORD=${POSTGRES_PASSWORD:-postgres}
DB_NAME=${POSTGRES_DB:-powerplantapp}
DB_HOST=${POSTGRES_HOST:-postgres}
BACKUP_DIR="/app/backups"

# Create backups directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Timestamp for backup filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

echo "Creating database backup: $BACKUP_FILE"

# Export the database using pg_dump
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -U $DB_USER $DB_NAME > $BACKUP_FILE

# Compress the backup
gzip $BACKUP_FILE
echo "Backup compressed: $BACKUP_FILE.gz"

# Clean up old backups (keep the 5 most recent ones)
cd $BACKUP_DIR
ls -t *.gz | tail -n +6 | xargs -r rm

echo "Backup completed successfully!"