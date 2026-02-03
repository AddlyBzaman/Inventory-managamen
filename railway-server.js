import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import railwayRouter from './api/railway.js';
import { eq, desc } from 'drizzle-orm';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', railwayRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Inventory Management API - Railway',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Railway API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
