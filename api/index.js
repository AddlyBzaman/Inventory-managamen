const express = require('express');
const cors = require('cors');
const railwayRouter = require('./railway.js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', railwayRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Inventory Management API Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});
