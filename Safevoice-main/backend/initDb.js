const User = require('./models/User');
const { connectDB } = require('./config/db');

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Create indexes for users collection
    await User.createIndexes();
    
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();