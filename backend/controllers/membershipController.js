const mongoose = require('mongoose');
const Membership = require('../models/Membership');
const Plan = require('../models/Plan');
const User = require('../models/User');

// ========================= DATE FORMATTER =========================
const formatDate = (date) => {
  return date ? new Date(date).toISOString().split("T")[0] : null; // yyyy-mm-dd
};

const formatMembership = (membership) => {
  if (!membership) return null;
  const obj = membership.toObject ? membership.toObject() : membership;
  obj.startDate = formatDate(obj.startDate);
  obj.endDate = formatDate(obj.endDate);
  return obj;
};

// ========================= CREATE MEMBERSHIP (Admin Only) =========================
const createMembership = async (req, res) => {
  try {
    const { userID, planID, startDate, renewalOption } = req.body;

    // Validate user
    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate plan
    let plan = null;
    if (mongoose.Types.ObjectId.isValid(planID)) {
      plan = await Plan.findById(planID);
    }
    if (!plan) plan = await Plan.findOne({ planID });
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Validate startDate
    const start = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for comparison
    if (start < today) {
      return res.status(400).json({ message: 'Start date cannot be in the past. Use today or a future date.' });
    }

    // Calculate end date
    const end = new Date(start);
    end.setMonth(end.getMonth() + plan.durationMonths);

    // 🚨 Check: Duplicate membership
    const duplicate = await Membership.findOne({
      userID: user._id,
      planID: plan._id,
      startDate: start
    });
    if (duplicate) {
      return res.status(400).json({ message: 'Membership with same plan and start date already exists for this user' });
    }

    // 🚨 Check: Active/future membership
    const overlapping = await Membership.findOne({
      userID: user._id,
      endDate: { $gte: new Date() }, // Check if any membership is still active today
      status: { $in: ['Active', 'Inactive'] }
    });
    if (overlapping) {
      return res.status(400).json({ message: 'User already has an active membership. Wait until it expires before creating a new one.' });
    }

    // Create membership
    const membership = new Membership({
      userID: user._id,
      userName: user.name,
      planID: plan._id,
      planName: plan.planName,
      description: plan.description,
      facilitiesIncluded: plan.benifits,
      price: plan.price,
      duration: `${plan.durationMonths} month(s)`,
      renewalOption: renewalOption !== undefined ? renewalOption : true,
      startDate: formatDate(start),  // 👉 ensures "2025-09-10"
      endDate: formatDate(end), 
      status: 'Active',
      active: true
    });

    await membership.save();
    res.status(201).json({ message: 'Membership created successfully', membership: formatMembership(membership) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= GET ALL MEMBERSHIPS =========================
const getAllMemberships = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, expired } = req.query;
    const skip = (page - 1) * limit;

    let filter = {};

    // User role: only their memberships
    if (req.user.role !== 'admin') {
      filter.userID = req.user._id;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // Expired filter
    if (expired === 'true') {
      filter.status = 'Expired';
    }

    const memberships = await Membership.find(filter)
      .populate('planID', 'planName description benifits price durationMonths')
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Membership.countDocuments(filter);

    // Ensure description is populated from plan if missing
    const membershipsWithDescription = memberships.map(membership => {
      const membershipObj = membership.toObject ? membership.toObject() : membership;
      // If membership doesn't have description but plan does, use plan description
      if (!membershipObj.description && membershipObj.planID?.description) {
        membershipObj.description = membershipObj.planID.description;
      }
      // Also ensure facilities are populated from plan if missing
      if (!membershipObj.facilitiesIncluded && membershipObj.planID?.benifits) {
        membershipObj.facilitiesIncluded = membershipObj.planID.benifits;
      }
      return membershipObj;
    });

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      memberships: membershipsWithDescription.map(formatMembership)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= GET MEMBERSHIP BY ID =========================
const getMembershipById = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id)
      .populate('planID', 'planName description benifits price durationMonths');
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    // Restrict access for normal user
    if (req.user.role !== 'admin' && membership.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Ensure description is populated from plan if missing
    const membershipObj = membership.toObject ? membership.toObject() : membership;
    if (!membershipObj.description && membershipObj.planID?.description) {
      membershipObj.description = membershipObj.planID.description;
    }
    // Also ensure facilities are populated from plan if missing
    if (!membershipObj.facilitiesIncluded && membershipObj.planID?.benifits) {
      membershipObj.facilitiesIncluded = membershipObj.planID.benifits;
    }

    res.json(formatMembership(membershipObj));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= UPDATE MEMBERSHIP RENEWAL OPTION (User) =========================
const updateMembershipRenewal = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    // Check if user owns this membership or is admin
    if (req.user.role !== 'admin' && membership.userID.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this membership' });
    }

    const { renewalOption } = req.body;

    if (renewalOption !== undefined) {
      membership.renewalOption = renewalOption;
    }

    await membership.save();
    res.json({ message: 'Membership renewal option updated successfully', membership: formatMembership(membership) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= UPDATE MEMBERSHIP (Admin Only) =========================
const updateMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    const { planID, renewalOption, startDate } = req.body;

    // Update plan details if provided
    if (planID) {
      const plan = await Plan.findById(planID);
      if (!plan) return res.status(404).json({ message: 'Plan not found' });

      membership.planID = plan._id;
      membership.planName = plan.planName;
      membership.description = plan.description;
      membership.facilitiesIncluded = plan.benifits;
      membership.price = plan.price;
      membership.duration = `${plan.durationMonths} month(s)`;

      let start = startDate ? new Date(startDate) : new Date(membership.startDate);

      // Validate startDate (cannot be in the past)
      if (startDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (start < today) {
          return res.status(400).json({ message: 'Start date cannot be in the past. Use today or a future date.' });
        }
      }

      const end = new Date(start);
      end.setMonth(end.getMonth() + plan.durationMonths);

      membership.startDate = formatDate(start); // store as YYYY-MM-DD
      membership.endDate = formatDate(end);     // store as YYYY-MM-DD

      // If admin updates plan, reactivate membership if it was expired
      membership.status = 'Active';
      membership.active = true;
    }

    if (renewalOption !== undefined) {
      membership.renewalOption = renewalOption;
    }

    await membership.save();
    res.json({ message: 'Membership updated successfully', membership: formatMembership(membership) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= DEACTIVATE MEMBERSHIP (Admin Only) =========================
const deactivateMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    if (!membership.active)
      return res.status(400).json({ message: 'Membership is already inactive' });

    membership.active = false;
    membership.status = 'Inactive'; // separate from "Expired" which cron handles
    await membership.save();

    res.json({ message: 'Membership deactivated successfully', membership: formatMembership(membership) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= REACTIVATE MEMBERSHIP (Admin Only) =========================
const reactivateMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    if (membership.active)
      return res.status(400).json({ message: 'Membership is already active' });

    membership.active = true;
    membership.status = 'Active'; // consistent with cron
    await membership.save();

    res.json({ message: 'Membership reactivated successfully', membership: formatMembership(membership) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= DELETE MEMBERSHIP (Admin Only) =========================
const deleteMembership = async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id);
    if (!membership) return res.status(404).json({ message: 'Membership not found' });

    await membership.deleteOne();
    res.json({ message: 'Membership deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= GET MEMBERSHIP STATISTICS =========================
const getMembershipStats = async (req, res) => {
  try {
    const memberships = await Membership.find();
    
    let totalMemberships = memberships.length;
    let activeMemberships = 0;
    let inactiveMemberships = 0;
    let expiredMemberships = 0;

    memberships.forEach(membership => {
      if (membership.status === 'Active' && membership.active) {
        activeMemberships++;
      } else if (membership.status === 'Inactive' && !membership.active) {
        inactiveMemberships++;
      } else if (membership.status === 'Expired') {
        expiredMemberships++;
        inactiveMemberships++; // Expired is also considered inactive
      }
    });

    res.json({
      totalMemberships,
      activeMemberships,
      inactiveMemberships,
      expiredMemberships
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMembership,
  getAllMemberships,
  getMembershipById,
  updateMembershipRenewal,
  updateMembership,
  deactivateMembership,
  reactivateMembership,
  deleteMembership,
  getMembershipStats
};
