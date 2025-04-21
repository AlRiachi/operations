#!/bin/bash
# Database restore script

set -e

# Configuration
DB_HOST=${PGHOST:-postgres}
DB_PORT=${PGPORT:-5432}
DB_USER=${PGUSER:-root}
DB_PASSWORD=${PGPASSWORD:-Resheh-2019}
DB_NAME=${PGDATABASE:-powerplantapp}
BACKUP_DIR=/app/backups

# Check if a backup file is provided as an argument
if [ "$1" ]; then
  BACKUP_FILE=$1
else
  # If no file is specified, use the most recent backup
  BACKUP_FILE=$(ls -t ${BACKUP_DIR}/backup_${DB_NAME}_*.sql.gz | head -n 1)
  
  if [ -z "$BACKUP_FILE" ]; then
    echo "Error: No backup files found in $BACKUP_DIR"
    exit 1
  fi
fi

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "Error: Backup file '$BACKUP_FILE' not found"
  exit 1
fi

echo "Restoring database $DB_NAME from backup file: $BACKUP_FILE"

# Ask for confirmation before proceeding
read -p "This will overwrite the existing database. Are you sure you want to continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Restore operation canceled"
  exit 0
fi

# Restore the database
echo "Restoring database... This may take a while"
gunzip -c $BACKUP_FILE | PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME

# Check if restore was successful
if [ $? -eq 0 ]; then
  echo "Database restore completed successfully"
else
  echo "Database restore failed"
  exit 1
fi

echo "Restore process completed"