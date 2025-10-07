const express = require('express');
const router = express.Router();
const {
  getTrainers,
  getTrainerById,
  getTrainerStats
} = require('../controllers/trainerController');

// ========================= TRAINER ROUTES =========================

// ✅ Get all trainers (with dynamic status) - PUBLIC
router.get('/', getTrainers);

// ✅ Get trainer statistics - PUBLIC
router.get('/stats', getTrainerStats);

// ✅ Get a single trainer by Mongo _id (with dynamic status) - PUBLIC
router.get('/:id', getTrainerById);


module.exports = router;
