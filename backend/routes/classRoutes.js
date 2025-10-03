const express = require('express');
const router = express.Router();
const {
  getAllClassesWithAvailability,
  getAllClasses,
  getClassById,
  getClassCount,
} = require('../controllers/classController');


router.get('/count', getClassCount);
router.get('/all-with-availability', getAllClassesWithAvailability);
router.get('/', getAllClasses);

// Get a single class by ID
router.get('/:id',  getClassById);


module.exports = router;
