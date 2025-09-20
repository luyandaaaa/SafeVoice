const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { register, login, verify, getMfaStatus, updateMfaStatus } = require('../controllers/authController');
const auth = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/verify', auth, verify);

router.post('/biometric', async (req, res) => {
  try {
    const { type, biometricToken } = req.body;

    // In a real implementation, you would:
    // 1. Verify the biometric token with a service like WebAuthn
    // 2. Check if the user has biometric authentication enabled
    // 3. Validate the biometric data
    
    // For demo purposes, we'll simulate successful biometric auth
    const mockUser = {
      _id: '123',
      name: 'Test User',
      email: 'test@example.com',
      biometricEnabled: true,
      preferredLanguage: 'en'
    };

    const token = jwt.sign(
      { user: { id: mockUser._id } },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: mockUser
    });
  } catch (error) {
    console.error('Biometric login error:', error);
    res.status(401).json({ msg: 'Biometric authentication failed' });
  }
});

// Token verification endpoint
router.get('/verify', auth, async (req, res) => {
  try {
    console.log('Verifying token for user ID:', req.user.id);
    
    // Get complete user data from database
    const user = await User.findById(req.user.id);
    
    if (!user) {
      console.error('User not found in database for ID:', req.user.id);
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('Found user:', { ...user, password: '[REDACTED]' });

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user;

    res.json({
      valid: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ msg: 'Token verification failed' });
  }
});

// Protected routes
router.get('/mfa-status', auth, getMfaStatus);
router.put('/mfa-status', auth, updateMfaStatus);

module.exports = router;