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

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;

    if (req.file) {
      user.profileImageURL = `http://localhost:8000/uploads/users/profile/${req.file.filename}`;
    }

    await user.save();

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};
