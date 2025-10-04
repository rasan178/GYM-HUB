const express = require('express');
const router = express.Router();
const {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  getTestimonialStats,
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


// Public: get approved testimonials
router.get('/', getTestimonials);

// Get testimonial statistics (admin only)
router.get('/stats', protect, getTestimonialStats);

// User: create testimonial (multiple images up to 5, with role/job)
router.post('/', protect, upload.array('images', 5), createTestimonial);

// User: update testimonial (within 10 days)
router.put('/:id', protect, upload.single('image'), updateTestimonial);


module.exports = router;
