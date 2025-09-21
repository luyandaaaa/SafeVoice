const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { upload, saveFileToIncident, getFileStream } = require('../utils/fileUpload');
const path = require('path');

// @route   POST /api/incidents
// @desc    Create a new incident
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Creating incident for userId:', userId);
    
    // Create incident data with userId
    const incidentData = {
      ...req.body,
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log('Incident data before create:', incidentData);
    
    // Add the incident directly to the user's document
    const User = require('../models/User');
    const incident = await User.addIncidentToUser(userId, incidentData);
    
    console.log('Created incident:', incident);
    res.json(incident);
  } catch (err) {
    console.error('Error creating incident:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/incidents/user
// @desc    Get all incidents for the logged in user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Backend - Fetching incidents for userId:', userId);
    console.log('User model methods available:', Object.keys(User));
    
    // Get user document first
    const user = await User.findById(userId);
    console.log('Found user:', user ? 'yes' : 'no');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return incidents array from user document
    const incidents = user.incidents || [];
    console.log('Found incidents:', incidents.length);
    
    res.json(incidents);
  } catch (err) {
    console.error('Error in /api/incidents/user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/incidents/count
// @desc    Get count of submitted incidents for the authenticated user
// @access  Private
router.get('/count', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Count only submitted incidents (not drafts)
    const count = user.incidents ? user.incidents.filter(incident => 
      incident.status === 'submitted' || 
      incident.status === 'under_review' || 
      incident.status === 'resolved'
    ).length : 0;
    
    res.json({ count });
  } catch (err) {
    console.error('Error counting incidents:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/incidents/:id
// @desc    Get incident by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    // Check if the user has permission to view this incident
    if (incident.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this incident' });
    }
    
    res.json(incident);
  } catch (err) {
    console.error('Error fetching incident:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/incidents/:id
// @desc    Update an incident
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    // Check if the user has permission to update this incident
    if (incident.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this incident' });
    }
    
    const updatedIncident = await Incident.updateById(req.params.id, req.body);
    res.json(updatedIncident);
  } catch (err) {
    console.error('Error updating incident:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/incidents/:id
// @desc    Delete an incident
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident) {
      return res.status(404).json({ message: 'Incident not found' });
    }
    
    // Check if the user has permission to delete this incident
    if (incident.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this incident' });
    }
    
    await Incident.deleteById(req.params.id);
    res.json({ message: 'Incident removed' });
  } catch (err) {
    console.error('Error deleting incident:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;