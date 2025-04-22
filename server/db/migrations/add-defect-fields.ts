import { db } from "../../db";
import { sql } from "drizzle-orm";

/**
 * Migration script to add new fields to the defects table:
 * - maintenance_feedback (text)
 * - work_type (text with enum)
 */
export async function addDefectFields() {
  console.log("Running migration: Adding maintenance_feedback and work_type fields to defects table");

  try {
    // Check if maintenance_feedback column already exists to avoid errors
    const checkMaintenanceFeedback = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'defects' AND column_name = 'maintenance_feedback'
    `);

    // Check if the column exists (result will be an empty array if it doesn't)
    const maintenanceFeedbackExists = (checkMaintenanceFeedback.rows || []).length > 0;
    if (!maintenanceFeedbackExists) {
      // Add maintenance_feedback column
      await db.execute(sql`
        ALTER TABLE defects
        ADD COLUMN maintenance_feedback TEXT
      `);
      console.log("Added maintenance_feedback column to defects table");
    } else {
      console.log("maintenance_feedback column already exists, skipping");
    }

    // Check if work_type column already exists to avoid errors
    const checkWorkType = await db.execute(sql`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'defects' AND column_name = 'work_type'
    `);

    // Check if the column exists (result will be an empty array if it doesn't)
    const workTypeExists = (checkWorkType.rows || []).length > 0;
    if (!workTypeExists) {
      // Create enum type for work_type if it doesn't exist
      await db.execute(sql`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'work_type_enum') THEN
                CREATE TYPE work_type_enum AS ENUM (
                    'shutdown_work', 
                    'running_maintenance', 
                    'emergency_repair', 
                    'preventive_maintenance', 
                    'inspection', 
                    'other'
                );
            END IF;
        END$$;
      `);

      // Add work_type column
      await db.execute(sql`
        ALTER TABLE defects
        ADD COLUMN work_type work_type_enum
      `);
      console.log("Added work_type column to defects table");
    } else {
      console.log("work_type column already exists, skipping");
    }

    console.log("Migration completed successfully");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
    return false;
  }
}