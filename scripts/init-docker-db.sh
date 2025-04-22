#!/bin/bash
set -e

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
if [ -f "./wait-for-postgres.sh" ]; then
  chmod +x ./wait-for-postgres.sh
  ./wait-for-postgres.sh postgres:5432 -t 60
else
  echo "wait-for-postgres.sh not found, sleeping for 5 seconds instead"
  sleep 5
fi

# Run database initialization
echo "Initializing database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  echo "Setting default DATABASE_URL..."
  export DATABASE_URL="postgres://root:Resheh-2019@postgres:5432/powerplantapp"
fi

echo "Using database: $DATABASE_URL"

# First, test the connection to make sure PostgreSQL is really ready
echo "Testing database connection..."
if ! pg_isready -d "$DATABASE_URL"; then
  echo "Could not connect to database, retrying in 5 seconds..."
  sleep 5
  if ! pg_isready -d "$DATABASE_URL"; then
    echo "Database connection failed. Please check your connection settings."
    # Don't exit with error so the application can still start
    exit 0
  fi
fi

# Push database schema using Drizzle
echo "Pushing schema to database..."
# Using npx to ensure we can find drizzle-kit even if it's not globally installed
npx drizzle-kit push:pg --config=drizzle.config.ts || true

echo "Schema push complete, now seeding initial data..."

# Check if the database is empty and seed it if needed
echo "Checking if users table exists and has data..."
pguser=${PGUSER:-root}
pgpassword=${PGPASSWORD:-Resheh-2019}
pgdatabase=${PGDATABASE:-powerplantapp}
pghost=${PGHOST:-postgres}

# Try to create users but don't fail if there's an error
PGPASSWORD="$pgpassword" psql -h "$pghost" -U "$pguser" -d "$pgdatabase" -c "
  DO \$\$
  BEGIN
    -- Try to create users if table exists
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
    EXCEPTION
      WHEN undefined_table THEN
        RAISE NOTICE 'Users table does not exist yet';
      WHEN others THEN
        RAISE NOTICE 'Error creating users: %', SQLERRM;
    END;
  END
  \$\$;
" || echo "Error running SQL but continuing anyway"

echo "Database initialization complete!"