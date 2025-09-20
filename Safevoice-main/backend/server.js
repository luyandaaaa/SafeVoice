// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import models
const User = require('./models/User');
const Incident = require('./models/Incident');
const Evidence = require('./models/Evidence');

// Import routes
const authRoutes = require('./routes/auth');
const reportsRoutes = require('./routes/reports');
const evidenceRoutes = require('./routes/evidence');
const usersRoutes = require('./routes/users');

// Auth middleware for protected routes
const authMiddleware = require('./middleware/auth');

// Basic root route
app.get('/', (req, res) => {
  res.json({ message: 'SafeVoice API is running 🚀' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is healthy' });
});

// Public routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);

// Protected routes
app.use('/api/reports', authMiddleware, reportsRoutes);
app.use('/api/evidence', authMiddleware, evidenceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB then start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ Database connected');
    
    // Initialize database indexes if models exist
    if (User.initialize) await User.initialize();
    if (Incident.initialize) await Incident.initialize();
    if (Evidence.initialize) await Evidence.initialize();
    console.log('✅ Database indexes created');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log('📝 Available routes:');
      console.log('   - POST /api/auth/register');
      console.log('   - POST /api/auth/login');
      console.log('   - GET /api/auth/verify');
      console.log('   - GET /api/auth/mfa-status');
      console.log('   - PUT /api/auth/mfa-status');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.stack);
    if (err.code === 'ENOTFOUND') {
      console.error('❌ MongoDB host not found. Check your MONGODB_URI in .env');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('❌ MongoDB connection refused. Make sure MongoDB is running');
    }
    process.exit(1);
  }
}

startServer();