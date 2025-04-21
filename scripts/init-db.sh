#!/bin/bash
set -e

echo "Initializing database..."

# Run database migrations using Drizzle
npm run db:push

# Seed default users if they don't exist
node scripts/seed-users.js

echo "Database initialization complete!"