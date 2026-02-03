const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock users database
const users = [
  {
    id: '1',
    username: 'admin',
    password: 'admin123',
    name: 'Administrator',
    role: 'admin',
    isActive: true
  },
  {
    id: '2',
    username: 'INA',
    password: 'INA123',
    name: 'INA User',
    role: 'user',
    isActive: true
  }
];

// Auth routes
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  console.log('Login attempt:', { username, password });
  
  const user = users.find(u => u.username === username && u.password === password && u.isActive);
  
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });
  } else {
    res.json({ success: false, error: 'Invalid credentials' });
  }
});

app.post('/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Inventory Management API Server (Simple)',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple API Server running on http://localhost:${PORT}`);
  console.log(`📊 Auth endpoints available at http://localhost:${PORT}/auth`);
  console.log(`👥 Test users:`);
  console.log(`   - admin / admin123`);
  console.log(`   - INA / INA123`);
});
