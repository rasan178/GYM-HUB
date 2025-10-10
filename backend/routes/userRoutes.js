// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getUserCount,
  removeProfileImage,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// -------------------- User Routes -------------------- //
// Get user count (public)
router.get('/count', getUserCount);

// Update profile (single image)
router.put('/profile', protect, upload.single('image'), updateProfile);

// Remove profile image
router.delete('/profile/image', protect, removeProfileImage);

module.exports = router;
