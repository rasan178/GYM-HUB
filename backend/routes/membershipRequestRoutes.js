const express = require('express');
const router = express.Router();
const {
  createMembershipRequest,
  getUserMembershipRequests,
  getAllMembershipRequests,
  approveMembershipRequest,
  rejectMembershipRequest,
  getMembershipRequestById,
  deleteMembershipRequest
} = require('../controllers/membershipRequestController');

const { protect, admin } = require('../middleware/authMiddleware');

// ===== Membership Request Routes =====
router.post('/', protect, createMembershipRequest);                    // User - create request
router.get('/my-requests', protect, getUserMembershipRequests);         // User - get own requests

// Admin routes
router.get('/admin/all', protect, admin, getAllMembershipRequests);     // Admin - get all requests
router.patch('/:id/approve', protect, admin, approveMembershipRequest); // Admin - approve request
router.patch('/:id/reject', protect, admin, rejectMembershipRequest);   // Admin - reject request
router.delete('/:id', protect, admin, deleteMembershipRequest);         // Admin - delete request

// User/Admin routes (must come after specific routes to avoid conflicts)
router.get('/:id', protect, getMembershipRequestById);                 // User/Admin - get request by ID

module.exports = router;



