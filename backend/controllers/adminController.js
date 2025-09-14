// backend/controllers/adminController.js

// Import existing controllers
const bookingController = require("./bookingController");
const classController = require("./classController");
const membershipController = require("./membershipController");
const testimonialController = require("./testimonialController");
const trainerController = require("./trainerController");
const userController = require("./userController");

// ========================= BOOKING ADMIN =========================
exports.updateBookingStatus = bookingController.updateBookingStatus;
exports.deleteBooking = bookingController.deleteBooking;

// ========================= CLASS ADMIN =========================
exports.createClass = classController.createClass;
exports.updateClass = classController.updateClass;
exports.deleteClass = classController.deleteClass;
exports.cancelClassDate = classController.cancelClassDate;
exports.activateClassDate = classController.activateClassDate;

// ========================= MEMBERSHIP ADMIN =========================
exports.createMembership = membershipController.createMembership;
exports.updateMembership = membershipController.updateMembership;
exports.deactivateMembership = membershipController.deactivateMembership;
exports.reactivateMembership = membershipController.reactivateMembership;
exports.deleteMembership = membershipController.deleteMembership;

// ========================= TESTIMONIAL ADMIN =========================
exports.getAllTestimonials = testimonialController.getAllTestimonials;
exports.approveTestimonial = testimonialController.approveTestimonial;
exports.rejectTestimonial = testimonialController.rejectTestimonial;
exports.deleteTestimonial = testimonialController.deleteTestimonial;

// ========================= TRAINER ADMIN =========================
exports.createTrainer = trainerController.createTrainer;
exports.updateTrainer = trainerController.updateTrainer;
exports.deleteTrainer = trainerController.deleteTrainer;

// ========================= USER ADMIN =========================
exports.getUsers = userController.getUsers;
exports.deleteUser = userController.deleteUser;
