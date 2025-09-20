const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get reports collection
const getReports = () => {
  const db = getDb();
  return db.collection('reports');
};

// Create indexes
async function createIndexes() {
  const reports = getReports();
  await reports.createIndex({ userId: 1 });
  await reports.createIndex({ createdAt: -1 });
}

// Get user's report stats
async function getUserStats(userId) {
  const reports = getReports();
  const stats = await reports.aggregate([
    { $match: { userId: new ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        activeAlerts: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0]
          }
        }
      }
    }
  ]).toArray();

  return stats[0] || { totalReports: 0, activeAlerts: 0 };
}

// Create a new report
async function create(reportData) {
  const reports = getReports();
  
  const newReport = {
    ...reportData,
    userId: new ObjectId(reportData.userId),
    status: 'submitted',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await reports.insertOne(newReport);
  return { ...newReport, _id: result.insertedId };
}

// Get reports by user ID
async function findByUserId(userId) {
  const reports = getReports();
  return await reports.find({ userId: new ObjectId(userId) }).toArray();
}

// Get report by ID
async function findById(id) {
  const reports = getReports();
  return await reports.findOne({ _id: new ObjectId(id) });
}

// Update report
async function updateById(id, updateData) {
  const reports = getReports();
  const result = await reports.updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...updateData, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

// Get stats for a user
async function getUserStats(userId) {
  const reports = getReports();
  const stats = await reports.aggregate([
    { $match: { userId: new ObjectId(userId) } },
    { 
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        activeAlerts: {
          $sum: {
            $cond: [{ $eq: ["$status", "active"] }, 1, 0]
          }
        }
      }
    }
  ]).toArray();

  return stats[0] || { totalReports: 0, activeAlerts: 0 };
}

module.exports = {
  getReports,
  createIndexes,
  create,
  findByUserId,
  findById,
  updateById,
  getUserStats
};