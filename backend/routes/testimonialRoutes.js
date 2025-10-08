const express = require('express');
const router = express.Router();
const {
  createTestimonial,
  getTestimonials,
  getMyTestimonials,
  updateTestimonial,
  deleteOwnTestimonial,
  getTestimonialStats,
} = require('../controllers/testimonialController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public: get approved testimonials
router.get('/', getTestimonials);

// Get testimonial statistics (protected)
router.get('/stats', protect, getTestimonialStats);

// User: get own testimonials
router.get('/my', protect, getMyTestimonials);

// User: create testimonial (multiple images up to 5, with role/job)
router.post('/', protect, upload.array('images', 5), createTestimonial);

// User: update testimonial (within 10 days, multiple images up to 5)
router.put('/:id', protect, upload.array('images', 5), updateTestimonial);

// User: delete own testimonial
router.delete('/:id', protect, deleteOwnTestimonial);

module.exports = router;