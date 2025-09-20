const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

// @route   GET api/auth/verify
// @desc    Verify token and get user data
// @access  Private
exports.verify = async (req, res) => {
  try {
    // User data should be attached by auth middleware
    if (!req.user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    res.json({
      valid: true,
      user: req.user
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(401).json({ msg: 'Token verification failed' });
  }
};

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, preferredLanguage } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create new user with all fields and default values
    const newUser = {
      name,
      email,
      password,
      phone,
      preferredLanguage,
      createdAt: new Date(),
      updatedAt: new Date(),
      biometricEnabled: false
    };

    const result = await User.create(newUser);

    // Create payload
    const payload = {
      user: {
        id: result.insertedId,
        name: newUser.name // Include name in token payload
      }
    };

    // Generate token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      async (err, token) => {
        if (err) throw err;
        // Get user data without password
        const user = await User.findById(result.insertedId);
        if (!user) throw new Error('User not found after creation');
        
        // Ensure we're not sending sensitive data
        const { password, ...userWithoutPassword } = user;
        res.json({ 
          token,
          user: userWithoutPassword
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findByEmail(email);
    
    // Use a consistent error message for both non-existent users and wrong passwords
    // to prevent user enumeration attacks
    const invalidCredentialsMsg = { 
      msg: 'The email or password you entered is incorrect',
      code: 'INVALID_CREDENTIALS'
    };
    
    if (!user) {
      console.log(`Login attempt failed: No user found with email ${email}`);
      return res.status(401).json(invalidCredentialsMsg);
    }

    // Validate password
    const isMatch = await User.matchPassword(user, password);
    if (!isMatch) {
      console.log(`Login attempt failed: Invalid password for user ${email}`);
      return res.status(401).json(invalidCredentialsMsg);
    }

    // Create payload with user info
    const payload = {
      user: {
        id: user._id.toString(), // Convert ObjectId to string
        name: user.name
      }
    };

    // Generate token
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove sensitive data and construct user response
    const { password: userPassword, ...userWithoutPassword } = user;

    // Add any missing fields with defaults
    const userResponse = {
      ...userWithoutPassword,
      name: user.name || '',
      phone: user.phone || '',
      profileImage: user.profileImage || '',
      mfaEnabled: user.mfaEnabled || false,
      biometricEnabled: user.biometricEnabled || false,
      preferredLanguage: user.preferredLanguage || 'en'
    };

    // Return token and user data (only one response)
    res.json({
      token,
      user: userResponse
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/auth/mfa-status
// @desc    Get user's MFA status
// @access  Private
exports.getMfaStatus = async (req, res) => {
  try {
    const user = await User.findById(new ObjectId(req.user.id));
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ mfaEnabled: user.mfaEnabled });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   PUT api/auth/mfa-status
// @desc    Update user's MFA status
// @access  Private
exports.updateMfaStatus = async (req, res) => {
  try {
    const { mfaEnabled } = req.body;
    const result = await User.updateById(
      new ObjectId(req.user.id), 
      { mfaEnabled }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json({ msg: 'MFA status updated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};