import { db, pool } from "../db";
import * as schema from "@shared/schema";
import { storage } from "../storage";

async function initializeDatabase() {
  console.log("Initializing database...");
  
  try {
    // Create tables using db:push
    console.log("Pushing schema to database...");
    // Note: We normally would use drizzle-kit push:pg here, but since we
    // can't update package.json, we'll use the Drizzle API directly
    const result = await db.execute(/* SQL */`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'operator',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT NOT NULL,
        priority TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        assigned_to_id INTEGER REFERENCES users(id),
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        photo_url TEXT
      );

      CREATE TABLE IF NOT EXISTS defects (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        location TEXT NOT NULL,
        category TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        assigned_to_id INTEGER REFERENCES users(id),
        created_by_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        photo_url TEXT
      );

      CREATE TABLE IF NOT EXISTS signals (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        value TEXT NOT NULL,
        unit TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'normal',
        source TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        user_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        related_id INTEGER,
        related_type TEXT
      );
    `);
    
    console.log("Database schema created successfully!");
    
    // Create demo users
    console.log("Creating demo users...");
    await storage.initializeDemoUsers();
    console.log("Demo users created successfully!");
    
    console.log("Database initialization complete!");
    
  } catch (error) {
    console.error("Error initializing database:", error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the initialization
initializeDatabase().catch(console.error);