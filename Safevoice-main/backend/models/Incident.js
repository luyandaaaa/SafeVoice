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
  const db = getDb();
  console.log('Creating incident with data:', data);
  
  // Ensure userId is converted to ObjectId
  let userObjectId;
  try {
    userObjectId = new ObjectId(data.userId);
    console.log('Successfully converted userId to ObjectId:', userObjectId.toString());
  } catch (err) {
    console.error('Error converting userId to ObjectId:', err);
    userObjectId = data.userId;
  }

  const incident = {
    userId: userObjectId,
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

  // Insert the incident
  const result = await collection.insertOne(incident);
  const createdIncident = { ...incident, _id: result.insertedId };

  // Update the user's incidents array
  try {
    await db.collection('users').updateOne(
      { _id: userObjectId },
      { 
        $push: { 
          incidents: result.insertedId,
          incidentHistory: {
            incidentId: result.insertedId,
            type: data.type,
            date: data.date,
            status: data.status || 'submitted',
            updatedAt: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      }
    );
    console.log('Updated user document with new incident');
  } catch (err) {
    console.error('Error updating user with incident:', err);
    // Don't throw - we still want to return the created incident even if user update fails
  }

  return createdIncident;
};

exports.findById = async (id) => {
  const collection = await initializeCollection();
  return await collection.findOne({ _id: new ObjectId(id) });
};

exports.findByUserId = async (userId) => {
  const db = getDb();
  const collection = await initializeCollection();
  console.log('Finding incidents for userId:', userId);
  
  try {
    const userObjectId = new ObjectId(userId);
    console.log('Successfully converted userId to ObjectId:', userObjectId.toString());
    
    // First get the user document to get their incidents array
    const user = await db.collection('users').findOne({ _id: userObjectId });
    console.log('Found user:', user ? 'yes' : 'no');
    
    if (!user || !user.incidents || user.incidents.length === 0) {
      console.log('No incidents found in user document');
      return [];
    }
    
    // Get all incidents referenced in the user's incidents array
    const incidents = await collection
      .find({ _id: { $in: user.incidents } })
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log('Found incidents from user document:', incidents.length);
    return incidents;
    
  } catch (err) {
    console.error('Error finding incidents by userId:', err);
    return [];
  }
  
  // First check all incidents to see what's there
  const allIncidents = await collection.find({}).toArray();
  console.log('Total incidents in collection:', allIncidents.length);
  console.log('Sample of incidents:', allIncidents.slice(0, 2));
  
  // Try to convert userId to ObjectId
  let userObjectId;
  try {
    userObjectId = new ObjectId(userId);
    console.log('Successfully converted userId to ObjectId:', userObjectId.toString());
  } catch (err) {
    console.error('Error converting userId to ObjectId:', err);
    userObjectId = userId; // Fallback to string if conversion fails
  }
  
  // Log all userIds in the collection
  const distinctUserIds = await collection.distinct('userId');
  console.log('All unique userIds in collection:', distinctUserIds);
  
  // Query with string ID first
  const stringQuery = { userId: userId };
  console.log('Trying string query:', stringQuery);
  const stringResults = await collection.find(stringQuery).toArray();
  console.log('String query results:', stringResults);

  // Query with ObjectId
  const objectIdQuery = { userId: userObjectId };
  console.log('Trying ObjectId query:', objectIdQuery);
  const objectIdResults = await collection.find(objectIdQuery).toArray();
  console.log('ObjectId query results:', objectIdResults);

  // Return whichever query found results
  const incidents = stringResults.length > 0 ? stringResults : objectIdResults;
  console.log('Final incidents count:', incidents.length);
  return incidents;
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