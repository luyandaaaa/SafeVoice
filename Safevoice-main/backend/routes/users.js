const express = require('express');
const router = express.Router();
const { getCollection } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

// Auth middleware
const validateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = getCollection('users');
    const user = await users.findOne({ _id: ObjectId(decoded.id) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Update profile route
router.put('/profile', validateToken, async (req, res) => {
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
router.get('/profile', validateToken, async (req, res) => {
  try {
    const { password, ...userWithoutPassword } = req.user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

module.exports = router;