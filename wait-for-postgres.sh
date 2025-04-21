#!/bin/bash
# wait-for-postgres.sh

set -e

# Get the database credentials from environment variables
DB_HOST=${PGHOST:-postgres}
DB_PORT=${PGPORT:-5432}
DB_USER=${PGUSER:-root}
DB_PASSWORD=${PGPASSWORD:-Resheh-2019}

until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - continuing"