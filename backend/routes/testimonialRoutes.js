const express = require('express');
const router = express.Router();
const {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


// Public: get approved testimonials
router.get('/', getTestimonials);

// User: create testimonial (single image, with role/job)
router.post('/', protect, upload.single('image'), createTestimonial);

// User: update testimonial (within 10 days)
router.put('/:id', protect, upload.single('image'), updateTestimonial);


module.exports = router;
