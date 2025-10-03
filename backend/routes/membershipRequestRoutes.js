const express = require('express');
const router = express.Router();
const {
  createMembershipRequest,
  getUserMembershipRequests,
  getAllMembershipRequests,
  approveMembershipRequest,
  rejectMembershipRequest,
  getMembershipRequestById
} = require('../controllers/membershipRequestController');

const { protect, admin } = require('../middleware/authMiddleware');

// ===== Membership Request Routes =====
router.post('/', protect, createMembershipRequest);                    // User - create request
router.get('/my-requests', protect, getUserMembershipRequests);         // User - get own requests
router.get('/:id', protect, getMembershipRequestById);                 // User/Admin - get request by ID

// Admin routes
router.get('/admin/all', protect, admin, getAllMembershipRequests);     // Admin - get all requests
router.patch('/:id/approve', protect, admin, approveMembershipRequest); // Admin - approve request
router.patch('/:id/reject', protect, admin, rejectMembershipRequest);   // Admin - reject request

module.exports = router;

