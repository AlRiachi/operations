import { Pool } from 'pg'; // Import Pool from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'; // Use the correct drizzle adapter
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

console.log("Connecting to database with URL:", process.env.DATABASE_URL.replace(/:.+@/, ':****@'));
// Use Pool from 'pg'
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// Use the node-postgres drizzle adapter
export const db = drizzle(pool, { schema });