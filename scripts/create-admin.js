import { createClient } from '@libsql/client';
import crypto from 'crypto';

async function createAdminUser() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || process.env.NEXT_PUBLIC_TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || process.env.NEXT_PUBLIC_TURSO_AUTH_TOKEN || '',
  });

  const adminUser = {
    id: crypto.randomUUID(),
    username: 'admin',
    email: 'admin@inventory.com',
    password: 'admin123', // In production, use bcrypt
    name: 'Administrator',
    role: 'admin',
    isActive: 1,
    createdAt: Date.now().toString(),
    updatedAt: Date.now().toString()
  };

  try {
    // Check if admin user already exists
    const existingUser = await client.execute('SELECT * FROM users WHERE username = ?', [adminUser.username]);
    
    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Insert admin user
    await client.execute(`
      INSERT INTO users (id, username, email, password, name, role, isActive, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      adminUser.id,
      adminUser.username,
      adminUser.email,
      adminUser.password,
      adminUser.name,
      adminUser.role,
      adminUser.isActive,
      adminUser.createdAt,
      adminUser.updatedAt
    ]);

    console.log('Admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();