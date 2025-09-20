const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded || !decoded.user || !decoded.user.id) {
      return res.status(401).json({ msg: 'Invalid token structure' });
    }

    console.log('Decoded token:', decoded);
    
    // Get user data from database using MongoDB native methods
    const user = await User.findById(decoded.user.id);
    
    console.log('Found user:', user);
    
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }

    // Remove sensitive data before attaching to request
    const { password, ...userWithoutPassword } = user;
    
    // Attach user data to request
    req.user = userWithoutPassword;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};