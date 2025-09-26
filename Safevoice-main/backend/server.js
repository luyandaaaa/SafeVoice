// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { connectDB } = require('./config/db');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Verify JWT_SECRET is loaded
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in environment variables');
  process.exit(1);
} else {
  console.log('JWT_SECRET is properly loaded');
}

// Create Express app
const app = express();

// Connect to MongoDB
connectDB()
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

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
const incidentsRoutes = require('./routes/incidents');
const uploadsRoutes = require('./routes/uploads');

// Serve static files from uploads directory with authentication
// Serve files with authentication
app.get('/api/uploads/files/:filename', async (req, res) => {
  const token = req.query.token;
  console.log('Received file request:', {
    filename: req.params.filename,
    hasToken: !!token
  });

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    // Debug token
    console.log('Token received:', {
      token: token.substring(0, 20) + '...',
      secret: process.env.JWT_SECRET ? 'Present' : 'Missing'
    });

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified successfully:', {
      userId: decoded.user?.id,
      userName: decoded.user?.name
    });
    
    // Get file path
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    // Debug log
    console.log('File details:', {
      requestedFile: filename,
      fullPath: filePath,
      exists: fs.existsSync(filePath)
    });
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Set content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
      '.mp3': 'audio/mpeg',
    };
    
    if (mimeTypes[ext]) {
      res.setHeader('Content-Type', mimeTypes[ext]);
    }

    // Set cache headers
    res.setHeader('Cache-Control', 'private, max-age=3600');
    
    // Send file directly
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(500).json({ message: 'Error serving file' });
      }
    });
  } catch (err) {
    console.error('Token verification error:', {
      error: err.message,
      stack: err.stack
    });
    return res.status(401).json({ 
      message: 'Invalid token',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Auth middleware for protected routes
const authMiddleware = require('./middleware/auth');

// Basic root route - redirect to auth page
app.get('/', (req, res) => {
  res.redirect('/auth');
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
app.use('/api/incidents', incidentsRoutes);
app.use('/api/uploads', uploadsRoutes);

// 404 handler - redirect to auth page
app.use((req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.redirect('/auth');
  } else {
    res.status(404).json({ error: 'API route not found' });
  }
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
    const server = app.listen(PORT).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy. Trying port ${PORT + 1}...`);
        app.listen(PORT + 1, () => {
          console.log(`🚀 Server running on http://localhost:${PORT + 1}`);
          console.log(`📊 Health check: http://localhost:${PORT + 1}/api/health`);
        });
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    }).on('listening', () => {
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