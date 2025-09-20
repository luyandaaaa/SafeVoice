const { getDb, connectDB } = require('../config/db');
const { ObjectId } = require('mongodb');

let incidents = null;

// Initialize collection and indexes
async function initializeCollection() {
  if (!incidents) {
    await connectDB();
    const db = getDb();
    incidents = db.collection('incidents');
    await incidents.createIndex({ 'location.coordinates': '2dsphere' });
    await incidents.createIndex({ 'location.address': 1 }); // Regular index instead of text
    await incidents.createIndex({ userId: 1 });
    console.log('Incident indexes created');
  }
  return incidents;
}

// Initialize the collection
initializeCollection().catch(console.error);

exports.create = async (data) => {
  const collection = await initializeCollection();
  const incident = {
    userId: new ObjectId(data.userId),
    type: data.type,
    urgency: data.urgency,
    date: data.date,
    time: data.time,
    // Store both GeoJSON for spatial queries and text location for display
    location: {
      type: 'Point',
      coordinates: data.coordinates || [0, 0], // [longitude, latitude]
      address: data.location || '' // Text description of location
    },
    description: data.description,
    perpetrator: data.perpetrator || '',
    witnesses: data.witnesses || '',
    notes: data.notes || '',
    anonymous: data.anonymous || false,
    consent: data.consent || { vault: false, ngo: false, court: false },
    status: data.status || 'submitted',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(incident);
  return { ...incident, _id: result.insertedId };
};

exports.findById = async (id) => {
  const collection = await initializeCollection();
  return await collection.findOne({ _id: new ObjectId(id) });
};

exports.findByUserId = async (userId) => {
  const collection = await initializeCollection();
  return await collection
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();
};

exports.updateById = async (id, data) => {
  const collection = await initializeCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } },
    { returnDocument: 'after' }
  );
  return result;
};

exports.deleteById = async (id) => {
  const collection = await initializeCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
};