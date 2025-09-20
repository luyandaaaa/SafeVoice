const { getDb } = require('../config/db');
const { ObjectId } = require('mongodb');

// Get incidents collection
const getIncidents = () => {
  const db = getDb();
  return db.collection('incidents');
};

// Create indexes when initializing
async function createIndexes() {
  const incidents = getIncidents();
  await incidents.createIndex({ location: '2dsphere' });
  await incidents.createIndex({ userId: 1 });
}

module.exports = {
  // Create a new incident
  async create(incidentData) {
    const incidents = getIncidents();
    const newIncident = {
      ...incidentData,
      userId: new ObjectId(incidentData.userId),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      location: {
        type: 'Point',
        coordinates: incidentData.location.coordinates || [0, 0]
      },
      evidenceFiles: incidentData.evidenceFiles || []
    };
    return await incidents.insertOne(newIncident);
  },

  // Find incident by ID
  async findById(id) {
    const incidents = getIncidents();
    return await incidents.findOne({ _id: new ObjectId(id) });
  },

  // Find incidents by user ID
  async findByUserId(userId) {
    const incidents = getIncidents();
    return await incidents.find({ userId: new ObjectId(userId) }).toArray();
  },

  // Update incident
  async updateById(id, updateData) {
    const incidents = getIncidents();
    updateData.updatedAt = new Date();
    return await incidents.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  },

  // Delete incident
  async deleteById(id) {
    const incidents = getIncidents();
    return await incidents.deleteOne({ _id: new ObjectId(id) });
  },

  // Get all incidents
  async getAll() {
    const incidents = getIncidents();
    return await incidents.find({}).toArray();
  },

  // Initialize function to create indexes
  initialize: createIndexes
};