import { addDefectFields } from "./add-defect-fields";

/**
 * Run all migrations in the correct order
 */
export async function runMigrations() {
  console.log("Starting database migrations...");
  
  // Run migrations in sequence
  await addDefectFields();
  
  console.log("All migrations completed");
}