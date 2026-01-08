// backend/controllers/userController.js
const User = require('../models/User');
const Booking = require('../models/Booking');
const Membership = require('../models/Membership');
const Testimonial = require('../models/Testimonial');

// Get all users (admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Get total user count
exports.getUserCount = async (req, res) => {
  try {
    // Count only users with role 'member', excluding 'admin'
    const count = await User.countDocuments({ role: 'user' });
    res.json({ count });
  } catch (error) {
    console.error('Error getting user count:', error);
    res.status(500).json({ message: 'Error getting user count' });
  }
};

// Get user statistics (admin)
exports.getUserStats = async (req, res) => {
  try {
    // Get total users (excluding admin role)
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Get active users (excluding admin role)
    const activeUsers = await User.countDocuments({ 
      role: { $ne: 'admin' }, 
      status: 'active' 
    });
    
    // Get inactive users (excluding admin role)
    const inactiveUsers = await User.countDocuments({ 
      role: { $ne: 'admin' }, 
      status: { $in: ['inactive', 'suspended'] } 
    });

    res.json({
      totalUsers,
      activeUsers,
      inactiveUsers
    });
  } catch (error) {
    console.error('Error getting user statistics:', error);
    res.status(500).json({ message: 'Error getting user statistics' });
  }
};

// Delete a user (admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await Booking.deleteMany({ userID: user._id });
    await Membership.deleteMany({ userID: user._id });
    await Testimonial.deleteMany({ userID: user._id });
    await user.deleteOne();

    res.json({ message: 'User removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user status (admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { status } = req.body;
    
    // Validate status
    if (!['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be active, inactive, or suspended' });
    }

    user.status = status;
    user.updatedDate = Date.now();
    await user.save();

    res.json({ 
      message: `User ${status === 'active' ? 'activated' : status === 'inactive' ? 'deactivated' : 'suspended'} successfully`,
      user: {
        userID: user.userID,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        updatedDate: user.updatedDate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    if (req.body.password) user.password = req.body.password;

    if (req.file) {
      const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
      user.profileImageURL = `${BASE_URL}/uploads/users/profile/${req.file.filename}`;
    }

    await user.save();

    res.json({ 
      message: 'Profile updated', 
      user: {
        userID: user.userID,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImageURL: user.profileImageURL,
        status: user.status,
        createdDate: user.createdDate,
        updatedDate: user.updatedDate
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Remove profile image
exports.removeProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Reset to default profile image
    user.profileImageURL = '/images/default-profile.svg';
    await user.save();

    res.json({ 
      message: 'Profile image removed successfully', 
      user: {
        userID: user.userID,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImageURL: user.profileImageURL,
        status: user.status,
        createdDate: user.createdDate,
        updatedDate: user.updatedDate
      }
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};