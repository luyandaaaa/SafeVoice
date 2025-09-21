const fs = require('fs').promises;

// Function to save file details to incident
const saveFileToIncident = async (userId, incidentId, file) => {
  const db = require('./db').getDb();
  const { ObjectId } = require('mongodb');

  const fileData = {
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    path: file.path,
    uploadedAt: new Date()
  };

  await db.collection('users').updateOne(
    { 
      _id: new ObjectId(userId),
      'incidents._id': new ObjectId(incidentId)
    },
    {
      $push: {
        'incidents.$.attachments': fileData
      }
    }
  );

  return fileData;
};

// Function to get file stream
const getFileStream = async (filePath) => {
  return fs.createReadStream(filePath);
};

module.exports = {
  saveFileToIncident,
  getFileStream
};