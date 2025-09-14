const express = require('express');
const router = express.Router();

const {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  cancelBooking,
} = require('../controllers/bookingController');

const { protect } = require('../middleware/authMiddleware');

// ========================= USER ROUTES =========================
// Create a booking (class or personal)
router.post('/', protect, createBooking);

// Get all bookings (for user: their own; for admin: all)
router.get('/', protect, getBookings);

// Get single booking by ID
router.get('/:id', protect, getBookingById);

// Update booking (reschedule, change class/personal session)
router.put('/:id', protect, updateBooking);

// Cancel booking (user or admin)
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
