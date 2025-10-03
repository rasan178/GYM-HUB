// backend/routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// ========================= BOOKING ADMIN =========================
router.put("/bookings/:id/status", protect, admin, adminController.updateBookingStatus);
router.delete("/bookings/:id", protect, admin, adminController.deleteBooking);

// ========================= CLASS ADMIN =========================
router.post("/classes", protect, admin, upload.array("images", 5), adminController.createClass);
router.put("/classes/:id", protect, admin, upload.array("images", 5), adminController.updateClass);
router.delete("/classes/:id", protect, admin, adminController.deleteClass);
router.post("/classes/:id/cancel", protect, admin, adminController.cancelClassDate);
router.post("/classes/:id/activate", protect, admin, adminController.activateClassDate);

// ========================= MEMBERSHIP ADMIN =========================
router.post("/memberships", protect, admin, adminController.createMembership);
router.put("/memberships/:id", protect, admin, adminController.updateMembership);
router.patch("/memberships/deactivate/:id", protect, admin, adminController.deactivateMembership);
router.patch("/memberships/reactivate/:id", protect, admin, adminController.reactivateMembership);
router.delete("/memberships/:id", protect, admin, adminController.deleteMembership);

// ========================= TESTIMONIAL ADMIN =========================
router.get("/testimonials/all", protect, admin, adminController.getAllTestimonials);
router.put("/testimonials/approve/:id", protect, admin, adminController.approveTestimonial);
router.put("/testimonials/reject/:id", protect, admin, adminController.rejectTestimonial);
router.delete("/testimonials/:id", protect, admin, adminController.deleteTestimonial);

// ========================= TRAINER ADMIN =========================
router.post("/trainers", protect, admin, upload.single("image"), adminController.createTrainer);
router.put("/trainers/:id", protect, admin, upload.single("image"), adminController.updateTrainer);
router.delete("/trainers/:id", protect, admin, adminController.deleteTrainer);

// ========================= PLAN ADMIN =========================
router.post("/plans", protect, admin, adminController.createPlan);
router.put("/plans/:id", protect, admin, adminController.updatePlan);
router.delete("/plans/:id", protect, admin, adminController.deletePlan);

// ========================= MEMBERSHIP REQUESTS ADMIN =========================
router.get("/membership-requests", protect, admin, adminController.getAllMembershipRequests);
router.put("/membership-requests/approve/:id", protect, admin, adminController.approveMembershipRequest);
router.put("/membership-requests/reject/:id", protect, admin, adminController.rejectMembershipRequest);

// ========================= USER ADMIN =========================
router.get("/users", protect, admin, adminController.getUsers);
router.delete("/users/:id", protect, admin, adminController.deleteUser);

module.exports = router;
