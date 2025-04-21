#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
./wait-for-postgres.sh postgres:5432 -t 60

# Run database initialization
echo "Initializing database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  exit 1
fi

echo "Using database: $DATABASE_URL"

# Push database schema using Drizzle
echo "Pushing schema to database..."
npm run db:push

echo "Schema push complete, now seeding initial data..."

# Check if the database is empty and seed it if needed
echo "Checking if users table exists and has data..."
pguser=${PGUSER:-root}
pgpassword=${PGPASSWORD:-Resheh-2019}
pgdatabase=${PGDATABASE:-powerplantapp}
pghost=${PGHOST:-postgres}

PGPASSWORD="$pgpassword" psql -h "$pghost" -U "$pguser" -d "$pgdatabase" -c "
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
      INSERT INTO users (username, password, first_name, last_name, email, role, created_at, updated_at)
      VALUES 
        ('admin', '5c29a959abce4eda5f0e7a4e7ea53dce4fa0f0abbe8eaa63717e2fed5f193d4c.2d87e31636d78d67fcd451b76db638b7', 'Admin', 'User', 'admin@example.com', 'admin', NOW(), NOW()),
        ('operator', '5c29a959abce4eda5f0e7a4e7ea53dce4fa0f0abbe8eaa63717e2fed5f193d4c.2d87e31636d78d67fcd451b76db638b7', 'Operator', 'User', 'operator@example.com', 'operator', NOW(), NOW());
      RAISE NOTICE 'Created demo users';
    ELSE
      RAISE NOTICE 'Demo users already exist';
    END IF;
  END
  \$\$;
"

echo "Database initialization complete!"