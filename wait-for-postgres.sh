#!/bin/bash
# wait-for-postgres.sh

set -e

host="postgres"
user="postgres"
password="postgres"
db="powerplantapp"

until PGPASSWORD=$password psql -h "$host" -U "$user" -d "$db" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"