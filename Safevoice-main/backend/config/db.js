const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
let db = null;
let dbInitializing = null;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false, // Disabled strict mode to allow text indexes
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    if (!db) {
      if (!dbInitializing) {
        dbInitializing = client.connect()
          .then(() => {
            console.log('Connected to MongoDB');
            db = client.db('safevoice');
            return db;
          })
          .catch(err => {
            console.error('Error connecting to MongoDB:', err);
            dbInitializing = null;
            throw err;
          });
      }
      await dbInitializing;
    }
    return db;
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
    throw err;
  }
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
}

// Initialize connection
connectDB().catch(console.error);

module.exports = {
  connectDB,
  getDb
};