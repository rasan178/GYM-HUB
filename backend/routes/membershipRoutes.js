const express = require('express');
const router = express.Router();
const {
  getAllMemberships,
  getMembershipById,
  updateMembershipRenewal,
  getMembershipStats
} = require('../controllers/membershipController');

const { protect  } = require('../middleware/authMiddleware');

// ===== Membership Routes =====
router.get('/', protect, getAllMemberships);                 // User=own, Admin=all + filters + pagination
router.get('/stats', protect, getMembershipStats);           // Admin only - membership statistics
router.get('/:id', protect, getMembershipById);              // User=own, Admin=all
router.put('/:id/renewal', protect, updateMembershipRenewal); // User=own renewal option, Admin=any renewal option


module.exports = router;
