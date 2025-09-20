// User model using MongoDB native driver
const { getDb } = require('../config/db');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');

// Get users collection
const getUsers = () => {
  const db = getDb();
  return db.collection('users');
};

// Create indexes
async function createIndexes() {
  const users = getUsers();
  await users.createIndex({ email: 1 }, { unique: true });
}

// Default user fields
const defaultUserData = {
  name: '',
  email: '',
  phone: '',
  preferredLanguage: 'en',
  biometricEnabled: false,
  createdAt: new Date(),
  updatedAt: new Date()
};

// Find user by ID
async function findById(id) {
  try {
    const users = getUsers();
    return await users.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error('Error finding user by ID:', error);
    return null;
  }
}

// Find user by email
async function findByEmail(email) {
  try {
    const users = getUsers();
    return await users.findOne({ email });
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
}

// Validate user data
function validateUserData(userData) {
  const errors = [];
  
  if (!userData.name) errors.push('Name is required');
  if (!userData.email) errors.push('Email is required');
  if (!userData.password) errors.push('Password is required');
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (userData.email && !emailRegex.test(userData.email)) {
    errors.push('Invalid email format');
  }
  
  // Password strength check
  if (userData.password && userData.password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return errors;
}

// Create a new user
async function create(userData) {
  const users = getUsers();
    
  // Validate user data
  const validationErrors = validateUserData(userData);
  if (validationErrors.length > 0) {
    throw new Error('Validation failed: ' + validationErrors.join(', '));
  }
    
  // Check if user already exists
  const existingUser = await findByEmail(userData.email.toLowerCase());
  if (existingUser) {
    throw new Error('User with this email already exists');
  }
    
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userData.password, salt);
    
  // Create user document
  const newUser = {
    ...defaultUserData,
    ...userData,
    email: userData.email.toLowerCase(),
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  };
    
  // Insert into database
  const result = await users.insertOne(newUser);
  return { insertedId: result.insertedId, ...newUser };
}

// Match password
async function matchPassword(user, password) {
  return await bcrypt.compare(password, user.password);
}

// Export all functions
module.exports = {
  getUsers,
  createIndexes,
  validateUserData,
  findById,
  findByEmail,
  create,
  matchPassword,
  defaultUserData
};