const express = require('express');
const router = express.Router();
const {
  getAllClassesWithAvailability,
  getAllClasses,
  getClassById,
  getClassCount,
  getClassStats,
} = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');


router.get('/count', getClassCount);
router.get('/stats', protect, getClassStats);
router.get('/all-with-availability', protect, getAllClassesWithAvailability);
router.get('/', protect, getAllClasses);

// Get a single class by ID
router.get('/:id', protect, getClassById);


module.exports = router;
