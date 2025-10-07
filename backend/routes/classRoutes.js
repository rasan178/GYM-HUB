const express = require('express');
const router = express.Router();
const {
  getAllClassesWithAvailability,
  getAllClasses,
  getClassById,
  getClassCount,
  getClassStats,
} = require('../controllers/classController');


router.get('/count', getClassCount);
router.get('/stats',  getClassStats);
router.get('/all-with-availability',  getAllClassesWithAvailability);
router.get('/',  getAllClasses);

// Get a single class by ID
router.get('/:id',  getClassById);


module.exports = router;
