// backend/controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) return res.status(400).json({ message: 'User exists' });
  const user = await User.create({ name, email, password });
  if (user) {
    res.status(201).json({ _id: user._id, userID: user.userID, name: user.name, email: user.email, phoneNumber: user.phoneNumber, role: user.role, token: generateToken(user._id) });
  } else {
    res.status(400).json({ message: 'Invalid data' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await user.matchPassword(password)) {
    // Check if user account is active (exclude admins from this check)
    if (user.role !== 'admin' && user.status !== 'active') {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }
    res.json({ _id: user._id, userID: user.userID, name: user.name, email: user.email, phoneNumber: user.phoneNumber, role: user.role, status: user.status, token: generateToken(user._id) });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

exports.logout = (req, res) => res.json({ message: 'Logout successful' });

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.json({ 
      userID: user.userID, 
      name: user.name, 
      email: user.email, 
      phoneNumber: user.phoneNumber,
      role: user.role, 
      profileImageURL: user.profileImageURL, 
      status: user.status,
      createdDate: user.createdDate,
      updatedDate: user.updatedDate
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};