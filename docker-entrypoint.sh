#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
./wait-for-postgres.sh

# Initialize the database (migrations + seeding)
echo "Initializing the database..."
./scripts/init-db.sh

# Make sure all scripts are executable
chmod +x ./scripts/*.sh

# Schedule daily backups if in production mode
if [ "$NODE_ENV" = "production" ]; then
  echo "Setting up daily database backups..."
  # Add a cron job to run the backup script daily at 2 AM
  echo "0 2 * * * /app/scripts/backup-db.sh" > /tmp/crontab
  crontab /tmp/crontab
  rm /tmp/crontab
  
  # Start cron service
  service cron start
fi

# Start the application
echo "Starting the application..."
exec "$@"