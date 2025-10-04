const express = require('express');
const router = express.Router();
const {
  getTrainers,
  getTrainerById,
  getTrainerStats
} = require('../controllers/trainerController');
const { protect } = require('../middleware/authMiddleware');

// ========================= TRAINER ROUTES =========================

// ✅ Get all trainers (with dynamic status)
router.get('/', protect, getTrainers);

// ✅ Get trainer statistics
router.get('/stats', protect, getTrainerStats);

// ✅ Get a single trainer by Mongo _id (with dynamic status)
router.get('/:id', protect, getTrainerById);


module.exports = router;
