const express = require('express');
const router = express.Router();
const {
  getTrainers,
  getTrainerById,

} = require('../controllers/trainerController');

// ========================= TRAINER ROUTES =========================

// ✅ Get all trainers (with dynamic status)
router.get('/', getTrainers);

// ✅ Get a single trainer by Mongo _id (with dynamic status)
router.get('/:id', getTrainerById);


module.exports = router;
