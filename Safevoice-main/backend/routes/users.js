const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Report = require('../models/Report');
const Evidence = require('../models/Evidence');
const { ObjectId } = require('mongodb');

// @route   GET api/users/stats
// @desc    Get user's dashboard stats
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get report stats
    const reportStats = await Report.getUserStats(userId);
    
    // Get evidence stats using the exported getUserStats function
    const evidenceStats = await Evidence.getUserStats(userId);

    res.json({
      activeAlerts: reportStats.activeAlerts || 0,
      totalReports: reportStats.totalReports || 0,
      safeLocations: 0,
      riskAreas: 0,
      communityMembers: 0,
      averageResponseTime: "0 min",
      totalEvidence: evidenceStats.totalEvidence || 0,
      privateEvidence: evidenceStats.privateEvidence || 0
    });
  } catch (err) {
    console.error('Error getting user stats:', err);
    res.status(500).send('Server error');
  }
});

// Update profile route
router.put('/profile', auth, async (req, res) => {
  try {
    const users = getCollection('users');
    const { name, email, phone } = req.body;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (email !== req.user.email) {
        const existingUser = await users.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already in use' });
        }
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email: email.toLowerCase() }),
      ...(phone && { phone }),
      updatedAt: new Date()
    };

    const updatedUser = await users.findOneAndUpdate(
      { _id: ObjectId(req.user._id) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get profile route
router.get('/profile', auth, async (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;