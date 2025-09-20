const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get evidence collection
const getEvidence = () => {
  const db = getDb();
  return db.collection('evidence');
};

// Create indexes when initializing
async function createIndexes() {
  const evidence = getEvidence();
  await evidence.createIndex({ userId: 1 });
  await evidence.createIndex({ incidentId: 1 });
}

module.exports = {
  // Create new evidence
  async create(evidenceData) {
    const evidence = getEvidence();
    const newEvidence = {
      ...evidenceData,
      userId: new ObjectId(evidenceData.userId),
      incidentId: new ObjectId(evidenceData.incidentId),
      createdAt: new Date()
    };
    return await evidence.insertOne(newEvidence);
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