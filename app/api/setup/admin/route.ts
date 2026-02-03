import { createClient } from '@libsql/client';

export async function POST() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL || '',
      authToken: process.env.TURSO_AUTH_TOKEN || '',
    });

    const adminUser = {
      id: crypto.randomUUID(),
      username: 'admin',
      email: 'admin@inventory.com',
      password: 'admin123',
      name: 'Administrator',
      role: 'admin',
      isActive: 1,
      createdAt: Date.now().toString(),
      updatedAt: Date.now().toString()
    };

    // Check if admin user already exists
    const existingUser = await client.execute('SELECT * FROM users WHERE username = ?', [adminUser.username]);
    
    if (existingUser.rows.length > 0) {
      return Response.json({ 
        success: false, 
        message: 'Admin user already exists' 
      });
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

    return Response.json({ 
      success: true, 
      message: 'Admin user created successfully',
      user: {
        username: adminUser.username,
        password: adminUser.password
      }
    });

  } catch (error) {
    console.error('Error creating admin user:', error);
    return Response.json({ 
      success: false, 
      message: 'Failed to create admin user',
      error: error.message 
    });
  }
}
