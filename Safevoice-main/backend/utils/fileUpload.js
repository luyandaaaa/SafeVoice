const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure storage
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: function (req, file, cb) {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images, audio, and video
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'video/mp4',
    'video/mpeg',
    'video/quicktime'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, audio, and video files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

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

// Export the configured multer instance directly
module.exports = upload;