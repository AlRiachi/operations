#!/bin/bash
set -e

echo "========================================="
echo "Power Plant Operations Management System"
echo "Development Environment Startup"
echo "========================================="

echo "Setting up environment..."
export NODE_ENV=development
export PATH="$PATH:/app/node_modules/.bin"

# Check if TSX is available
if ! command -v tsx &> /dev/null; then
    echo "TSX not found, installing globally..."
    npm install -g tsx
fi

# Create client/tsconfig.json if it doesn't exist
if [ ! -f /app/client/tsconfig.json ]; then
    echo "Creating client/tsconfig.json..."
    mkdir -p /app/client
    cat > /app/client/tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"],
      "@assets/*": ["../attached_assets/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF
fi

# Create client/tsconfig.node.json if it doesn't exist
if [ ! -f /app/client/tsconfig.node.json ]; then
    echo "Creating client/tsconfig.node.json..."
    mkdir -p /app/client
    cat > /app/client/tsconfig.node.json << EOF
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF
fi

echo "Waiting for PostgreSQL to start..."
./wait-for-postgres.sh postgres:5432 -t 60

echo "Initializing database..."
# Using pg_isready to test the connection
pguser=${PGUSER:-root}
pgpassword=${PGPASSWORD:-Resheh-2019}
pgdatabase=${PGDATABASE:-powerplantapp}
pghost=${PGHOST:-postgres}
pgport=${PGPORT:-5432}

echo "Testing database connection to $pghost:$pgport..."
PGPASSWORD="$pgpassword" pg_isready -h "$pghost" -p "$pgport" -U "$pguser" -d "$pgdatabase" -t 10

if [ $? -ne 0 ]; then
    echo "WARNING: Could not connect to database. Will retry during application startup."
else
    echo "Database connection successful."
    
    echo "Pushing schema to database..."
    npm run db:push || true
    
    echo "Seeding initial data if needed..."
    # Try to create users but don't fail if there's an error
    PGPASSWORD="$pgpassword" psql -h "$pghost" -p "$pgport" -U "$pguser" -d "$pgdatabase" -c "
      DO \$\$
      BEGIN
        -- Try to create users if table exists
        BEGIN
          IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
            IF NOT EXISTS (SELECT 1 FROM users LIMIT 1) THEN
              INSERT INTO users (username, password, first_name, last_name, email, role, created_at, updated_at)
              VALUES 
                ('admin', '5c29a959abce4eda5f0e7a4e7ea53dce4fa0f0abbe8eaa63717e2fed5f193d4c.2d87e31636d78d67fcd451b76db638b7', 'Admin', 'User', 'admin@example.com', 'admin', NOW(), NOW()),
                ('operator', '5c29a959abce4eda5f0e7a4e7ea53dce4fa0f0abbe8eaa63717e2fed5f193d4c.2d87e31636d78d67fcd451b76db638b7', 'Operator', 'User', 'operator@example.com', 'operator', NOW(), NOW());
              RAISE NOTICE 'Created demo users';
            ELSE
              RAISE NOTICE 'Demo users already exist';
            END IF;
          ELSE
            RAISE NOTICE 'Users table does not exist yet';
          END IF;
        EXCEPTION
          WHEN others THEN
            RAISE NOTICE 'Error checking/creating users: %', SQLERRM;
        END;
      END
      \$\$;
    " || echo "Error running SQL but continuing anyway"
fi

echo "Starting application in development mode..."
cd /app
export NODE_ENV=development

# Create a special package.dev.json that will directly use tsx 
echo "Creating development package.json with direct tsx usage..."
cat > /app/package.dev.json << EOF
{
  "name": "powerplant-app-dev",
  "version": "1.0.0",
  "description": "Power Plant Operations Management System (Development)",
  "type": "module",
  "scripts": {
    "dev": "NODE_ENV=development tsx --watch server/index.ts",
    "db:push": "drizzle-kit push:pg"
  }
}
EOF

# Run the application using npm with our special dev package.json
echo "Starting application with: NODE_ENV=development npm --userconfig=/app/package.dev.json run dev"
cd /app
NODE_ENV=development npm --userconfig=/app/package.dev.json run dev