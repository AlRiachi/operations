#!/bin/bash
# Database backup script

set -e

# Configuration
DB_HOST=${PGHOST:-postgres}
DB_PORT=${PGPORT:-5432}
DB_USER=${PGUSER:-root}
DB_PASSWORD=${PGPASSWORD:-Resheh-2019}
DB_NAME=${PGDATABASE:-powerplantapp}
BACKUP_DIR=/app/backups
DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE=${BACKUP_DIR}/backup_${DB_NAME}_${DATE}.sql.gz

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

# Create backup
echo "Creating backup of $DB_NAME database to $BACKUP_FILE..."
PGPASSWORD=$DB_PASSWORD pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "Backup completed successfully"
  echo "Backup file: $BACKUP_FILE"
  echo "Backup size: $(du -h $BACKUP_FILE | cut -f1)"
else
  echo "Backup failed"
  exit 1
fi

# Clean up old backups - keep only the last 10
NUM_TO_KEEP=10
echo "Cleaning up old backups, keeping the latest $NUM_TO_KEEP..."
ls -t ${BACKUP_DIR}/backup_${DB_NAME}_*.sql.gz | tail -n +$((NUM_TO_KEEP+1)) | xargs -r rm

echo "Backup process completed"