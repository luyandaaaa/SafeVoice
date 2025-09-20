const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get evidence collection
const getEvidence = () => {
  const db = getDb();
  return db.collection('evidence');
};

// Create indexes
async function createIndexes() {
  const evidence = getEvidence();
  await evidence.createIndex({ userId: 1 });
  await evidence.createIndex({ reportId: 1 });
  await evidence.createIndex({ createdAt: -1 });
}

// Get user's evidence stats
async function getUserStats(userId) {
  const evidence = getEvidence();
  const stats = await evidence.aggregate([
    { $match: { userId: new ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalEvidence: { $sum: 1 },
        privateEvidence: {
          $sum: {
            $cond: [{ $eq: ["$status", "private"] }, 1, 0]
          }
        }
      }
    }
  ]).toArray();

  return stats[0] || { totalEvidence: 0, privateEvidence: 0 };
}

module.exports = {
  getUserStats,
  // Create new evidence
  async create(evidenceData) {
    const evidence = getEvidence();
    const newEvidence = {
      ...evidenceData,
      userId: new ObjectId(evidenceData.userId),
      reportId: new ObjectId(evidenceData.reportId),
      status: evidenceData.status || 'private',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await evidence.insertOne(newEvidence);
    return { ...newEvidence, _id: result.insertedId };
  },

  // Find evidence by ID
  async findById(id) {
    const evidence = getEvidence();
    return await evidence.findOne({ _id: new ObjectId(id) });
  },

  // Find evidence by incident ID
  async findByIncidentId(incidentId) {
    const evidence = getEvidence();
    return await evidence.find({ incidentId: new ObjectId(incidentId) }).toArray();
  },

  // Delete evidence
  async deleteById(id) {
    const evidence = getEvidence();
    return await evidence.deleteOne({ _id: new ObjectId(id) });
  },

  // Initialize function to create indexes
  initialize: createIndexes
};