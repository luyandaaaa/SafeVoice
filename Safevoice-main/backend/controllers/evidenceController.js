const Evidence = require('../models/Evidence');
const crypto = require('crypto');

// @route   POST api/evidence/upload
// @desc    Upload evidence files
// @access  Private
exports.uploadEvidence = async (req, res) => {
  try {
    const { incidentId, fileType, filePath, metadata } = req.body;
    
    // Generate encryption key for the evidence
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    
    const evidence = new Evidence({
      userId: req.user.id,
      incidentId,
      fileType,
      filePath,
      metadata,
      encryptionKey
    });

    const savedEvidence = await evidence.save();
    res.json(savedEvidence);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   GET api/evidence/:incidentId
// @desc    Get all evidence for an incident
// @access  Private
exports.getEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.find({ 
      incidentId: req.params.incidentId,
      userId: req.user.id 
    });
    
    res.json(evidence);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE api/evidence/:id
// @desc    Delete evidence
// @access  Private
exports.deleteEvidence = async (req, res) => {
  try {
    const evidence = await Evidence.findById(req.params.id);
    
    if (!evidence) {
      return res.status(404).json({ msg: 'Evidence not found' });
    }

    // Make sure user owns evidence
    if (evidence.userId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await evidence.deleteOne();
    res.json({ msg: 'Evidence removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};