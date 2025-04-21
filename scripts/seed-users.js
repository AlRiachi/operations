// Script to seed users for development and testing
const { createHmac } = require('crypto');
const { Pool } = require('@neondatabase/serverless');

// Get database connection details from environment variables
const DB_HOST = process.env.PGHOST || 'postgres';
const DB_PORT = process.env.PGPORT || 5432;
const DB_USER = process.env.PGUSER || 'root';
const DB_PASSWORD = process.env.PGPASSWORD || 'Resheh-2019';
const DB_NAME = process.env.PGDATABASE || 'powerplantapp';

// Create a connection pool
const pool = new Pool({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME
});

// Hash password function
async function hashPassword(password) {
  const salt = createHmac('sha256', 'seed-salt').update(Math.random().toString()).digest('hex').substring(0, 16);
  const hash = createHmac('sha256', salt).update(password).digest('hex');
  return `${hash}.${salt}`;
}

async function seedUsers() {
  try {
    console.log('Seeding users...');
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.error('Users table does not exist');
      return;
    }
    
    // Check if users already exist
    const userCount = await pool.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('Users already exist, skipping seed');
      return;
    }
    
    // Admin user
    const adminPassword = await hashPassword('admin123');
    await pool.query(`
      INSERT INTO users (username, password, "firstName", "lastName", email, role, "createdAt", "updatedAt")
      VALUES ('admin', $1, 'Admin', 'User', 'admin@powerplant.com', 'admin', NOW(), NOW())
    `, [adminPassword]);
    
    // Operator user
    const operatorPassword = await hashPassword('operator123');
    await pool.query(`
      INSERT INTO users (username, password, "firstName", "lastName", email, role, "createdAt", "updatedAt")
      VALUES ('operator', $1, 'Operator', 'User', 'operator@powerplant.com', 'operator', NOW(), NOW())
    `, [operatorPassword]);
    
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
  } finally {
    // Close the connection pool
    await pool.end();
  }
}

// Run the seeding function
seedUsers();