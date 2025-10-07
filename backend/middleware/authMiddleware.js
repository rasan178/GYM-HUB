const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user and set isAdmin flag
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Check if user account is active (exclude admins from this check)
    if (req.user.role !== 'admin' && req.user.status !== 'active') {
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    req.user.isAdmin = req.user.role === 'admin'; // <-- added
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

module.exports = { protect, admin };
