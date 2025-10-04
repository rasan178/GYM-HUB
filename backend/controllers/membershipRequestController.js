const mongoose = require('mongoose');
const MembershipRequest = require('../models/MembershipRequest');
const Membership = require('../models/Membership');
const Plan = require('../models/Plan');
const User = require('../models/User');

// ========================= DATE FORMATTER =========================
const formatDate = (date) => {
  return date ? new Date(date).toISOString().split("T")[0] : null; // yyyy-mm-dd
};

const formatMembershipRequest = (request) => {
  if (!request) return null;
  const obj = request.toObject();
  obj.requestedStartDate = formatDate(obj.requestedStartDate);
  obj.processedAt = obj.processedAt ? new Date(obj.processedAt).toISOString() : null;
  return obj;
};

// ========================= CREATE MEMBERSHIP REQUEST (User) =========================
const createMembershipRequest = async (req, res) => {
  try {
    const { planID, requestedStartDate, message } = req.body;
    const userID = req.user._id;

    // Validate plan
    const plan = await Plan.findById(planID);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Validate requested start date
    const start = new Date(requestedStartDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (start < today) {
      return res.status(400).json({ message: 'Requested start date cannot be in the past' });
    }

    // Check if user already has an active membership
    const activeMembership = await Membership.findOne({
      userID: userID,
      endDate: { $gte: start },
      status: { $in: ['Active', 'Inactive'] }
    });
    if (activeMembership) {
      return res.status(400).json({ 
        message: 'You already have an active membership. Please wait until it expires before requesting a new one.' 
      });
    }

    // Check if user already has a pending request for the same plan
    const existingRequest = await MembershipRequest.findOne({
      userID: userID,
      planID: plan._id,
      status: 'Pending'
    });
    if (existingRequest) {
      return res.status(400).json({ 
        message: 'You already have a pending request for this plan' 
      });
    }

    // Create membership request
    const membershipRequest = new MembershipRequest({
      userID: userID,
      userName: req.user.name,
      planID: plan._id,
      planName: plan.planName,
      requestedStartDate: formatDate(start),
      message: message || '',
      status: 'Pending'
    });

    await membershipRequest.save();
    res.status(201).json({ 
      message: 'Membership request submitted successfully', 
      request: formatMembershipRequest(membershipRequest) 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= GET USER'S MEMBERSHIP REQUESTS =========================
const getUserMembershipRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = { userID: req.user._id };

    if (status) {
      filter.status = status;
    }

    const requests = await MembershipRequest.find(filter)
      .populate('planID', 'planName price durationMonths description')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await MembershipRequest.countDocuments(filter);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      requests: requests.map(formatMembershipRequest)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= GET ALL MEMBERSHIP REQUESTS (Admin) =========================
const getAllMembershipRequests = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    const requests = await MembershipRequest.find(filter)
      .populate('userID', 'name email')
      .populate('planID', 'planName price durationMonths description')
      .populate('processedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await MembershipRequest.countDocuments(filter);

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      requests: requests.map(formatMembershipRequest)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= APPROVE MEMBERSHIP REQUEST (Admin) =========================
const approveMembershipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const request = await MembershipRequest.findById(id)
      .populate('userID', 'name')
      .populate('planID');
    
    if (!request) return res.status(404).json({ message: 'Membership request not found' });
    
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    // Check if user still has an active membership
    const activeMembership = await Membership.findOne({
      userID: request.userID._id,
      endDate: { $gte: new Date(request.requestedStartDate) },
      status: { $in: ['Active', 'Inactive'] }
    });
    if (activeMembership) {
      return res.status(400).json({ 
        message: 'User now has an active membership. Cannot approve this request.' 
      });
    }

    // Create the membership
    const start = new Date(request.requestedStartDate);
    const end = new Date(start);
    end.setMonth(end.getMonth() + request.planID.durationMonths);

    const membership = new Membership({
      userID: request.userID._id,
      userName: request.userName,
      planID: request.planID._id,
      planName: request.planName,
      facilitiesIncluded: request.planID.description,
      price: request.planID.price,
      duration: `${request.planID.durationMonths} month(s)`,
      renewalOption: true,
      startDate: formatDate(start),
      endDate: formatDate(end),
      status: 'Active',
      active: true
    });

    await membership.save();

    // Update the request
    request.status = 'Approved';
    request.adminNotes = adminNotes || '';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.json({ 
      message: 'Membership request approved and membership created successfully', 
      membership: membership,
      request: formatMembershipRequest(request)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= REJECT MEMBERSHIP REQUEST (Admin) =========================
const rejectMembershipRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const request = await MembershipRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Membership request not found' });
    
    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request has already been processed' });
    }

    request.status = 'Rejected';
    request.adminNotes = adminNotes || '';
    request.processedBy = req.user._id;
    request.processedAt = new Date();
    await request.save();

    res.json({ 
      message: 'Membership request rejected', 
      request: formatMembershipRequest(request)
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= GET MEMBERSHIP REQUEST BY ID =========================
const getMembershipRequestById = async (req, res) => {
  try {
    const request = await MembershipRequest.findById(req.params.id)
      .populate('userID', 'name email')
      .populate('planID', 'planName price durationMonths description')
      .populate('processedBy', 'name');
    
    if (!request) return res.status(404).json({ message: 'Membership request not found' });

    // Check if user can access this request
    if (req.user.role !== 'admin' && request.userID._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(formatMembershipRequest(request));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMembershipRequest,
  getUserMembershipRequests,
  getAllMembershipRequests,
  approveMembershipRequest,
  rejectMembershipRequest,
  getMembershipRequestById
};



