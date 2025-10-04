const Plan = require('../models/Plan');

// ========================= GET ALL PLANS =========================
const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    
    // Return empty array instead of 404 when no plans exist
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= GET PLAN BY ID =========================
const getPlanById = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========================= CREATE PLAN (Admin Only) =========================
const createPlan = async (req, res) => {
  try {
    const { planName, description, benifits, price, durationMonths } = req.body;

    // Check if plan with same name already exists
    const existingPlan = await Plan.findOne({ planName });
    if (existingPlan) {
      return res.status(400).json({ message: 'Plan with this name already exists' });
    }

    const plan = new Plan({
      planName,
      description,
      benifits,
      price: Number(price),
      durationMonths: Number(durationMonths)
    });

    await plan.save();
    res.status(201).json({ message: 'Plan created successfully', plan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= UPDATE PLAN (Admin Only) =========================
const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const { planName, description, benifits, price, durationMonths } = req.body;

    // Check if plan with same name already exists (excluding current plan)
    if (planName && planName !== plan.planName) {
      const existingPlan = await Plan.findOne({ planName });
      if (existingPlan) {
        return res.status(400).json({ message: 'Plan with this name already exists' });
      }
    }

    plan.planName = planName || plan.planName;
    plan.description = description || plan.description;
    plan.benifits = benifits || plan.benifits;
    plan.price = price ? Number(price) : plan.price;
    plan.durationMonths = durationMonths ? Number(durationMonths) : plan.durationMonths;

    await plan.save();
    res.json({ message: 'Plan updated successfully', plan });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ========================= DELETE PLAN (Admin Only) =========================
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    await plan.deleteOne();
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan
};