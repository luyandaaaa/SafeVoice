const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../utils/fileUpload');
const { saveFileToIncident, getFileStream } = require('../utils/fileHelpers');
const path = require('path');
const fs = require('fs');

// Route to handle file uploads
router.post('/', auth, upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    console.log('Files received:', req.files);

    const files = req.files.map(file => {
      console.log('Processing file:', file.filename);
      return {
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/api/uploads/files/${file.filename}`,
        uploadedAt: new Date()
      };
    });

    console.log('Processed files:', files);
    res.json(files);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Error uploading files' });
  }
});

// Route to serve uploaded files
router.get('/:filename', auth, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads', filename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Send file
  res.sendFile(filePath);
});

module.exports = router;