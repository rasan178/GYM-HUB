// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
  updateProfile,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// -------------------- User Routes -------------------- //
// Update profile (single image)
router.put('/profile', protect, upload.single('image'), updateProfile);

module.exports = router;
