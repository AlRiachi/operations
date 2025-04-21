// Script to seed default users if they don't exist
import { db } from '../server/db.js';
import { eq } from 'drizzle-orm';
import { users } from '../shared/schema.js';
import { hashPassword } from '../server/auth.js';

async function seedUsers() {
  try {
    console.log('Checking if default users exist...');
    
    // Check if admin user exists
    const adminExists = await db.select().from(users).where(eq(users.username, 'admin')).limit(1);
    
    if (adminExists.length === 0) {
      console.log('Creating admin user...');
      await db.insert(users).values({
        username: 'admin',
        password: await hashPassword('admin123'),
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@powerplant.com',
        role: 'admin'
      });
    }
    
    // Check if operator user exists
    const operatorExists = await db.select().from(users).where(eq(users.username, 'operator')).limit(1);
    
    if (operatorExists.length === 0) {
      console.log('Creating operator user...');
      await db.insert(users).values({
        username: 'operator',
        password: await hashPassword('operator123'),
        firstName: 'Operator',
        lastName: 'User',
        email: 'operator@powerplant.com',
        role: 'operator'
      });
    }
    
    console.log('User seeding complete!');
  } catch (error) {
    console.error('Error seeding users:', error);
  }
}

// Run the seeding function
seedUsers();