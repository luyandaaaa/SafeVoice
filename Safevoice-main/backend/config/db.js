// db.js

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dbConnection = null;

/**
 * Connect to MongoDB and return the database connection
 */
async function connectDB() {
  try {
    if (dbConnection) {
      // Reuse existing connection
      return dbConnection;
    }

    // Connect to MongoDB cluster
    await client.connect();

    // Connect to the actual app database
    dbConnection = client.db("safevoice");

    // Optional: Ping to verify connection
    await dbConnection.command({ ping: 1 });
    console.log("✅ Successfully connected to MongoDB Atlas (safevoice)");

    return dbConnection;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    throw error;
  }
}

/**
 * Get the database connection (after connectDB has been called)
 */
function getDb() {
  if (!dbConnection) {
    throw new Error("Database not connected. Call connectDB() first.");
  }
  return dbConnection;
}

/**
 * Optional helper: Get a specific collection directly
 */
function getCollection(name) {
  return getDb().collection(name);
}

module.exports = {
  connectDB,
  getDb,
  getCollection, // optional helper
  client,
};