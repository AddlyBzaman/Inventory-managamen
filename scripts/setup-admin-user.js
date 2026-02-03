const { createClient } = require('@libsql/client');
const bcrypt = require('bcryptjs');

async function setupAdminUser() {
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'libsql://inventorydb-abdil.aws-ap-northeast-1.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njk3NTU2NDEsImlkIjoiMTZhNzU3NDItY2NkYy00YjlmLWExMmYtZTBlNTA5YWMyZjU1IiwicmlkIjoiYTI0ODAyMGEtN2UwOC00ZDA4LWI4ZmUtNzA2MGFlMGUwZTk4In0.Nm7oPTvaAj4SGYLn5ObM1GA-5kbPK_BhogSqA3yNaPRbnJVnjtQjwS6TEM9xlPGK7yaWJRAch8oL1oXvLMMwCA',
  });

  try {
    // Check if admin user exists
    const existingAdmin = await client.execute('SELECT * FROM users WHERE username = ?', ['admin']);
    
    if (existingAdmin.rows.length > 0) {
      console.log('✅ Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = {
      id: 'admin-' + Date.now(),
      username: 'admin',
      email: 'admin@inventory.com',
      password: 'admin123', // Simple password for demo
      name: 'Administrator',
      role: 'admin',
      isActive: 1,
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString()
    };

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

    console.log('✅ Admin user created successfully!');
    console.log('📝 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('');
    console.log('⚠️  Please change the password in production!');

  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
  }
}

setupAdminUser();
