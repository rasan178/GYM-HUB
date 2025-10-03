const express = require('express');
const router = express.Router();
const {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/planController');

const { protect, admin } = require('../middleware/authMiddleware');

// ===== Plan Routes =====
router.get('/', getAllPlans);                           // Public - get all plans
router.get('/:id', getPlanById);                        // Public - get plan by ID
router.post('/', protect, admin, createPlan);       // Admin only - create plan
router.put('/:id', protect, admin, updatePlan);     // Admin only - update plan
router.delete('/:id', protect, admin, deletePlan);  // Admin only - delete plan

module.exports = router;
