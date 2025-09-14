const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  membershipID: { type: String, unique: true }, // Auto-generated
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String }, // auto-filled from Users collection
  planID: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  planName: { type: String }, // auto-filled from Plans collection
  facilitiesIncluded: { type: String }, // from plan description
  price: { type: Number }, // from plan price
  duration: { type: String }, // e.g., "6 months"
  renewalOption: { type: Boolean, default: true },
  startDate: { type: String, required: true }, // user must send at creation
  endDate: { type: String }, // auto-calculated
  status: { type: String, enum: ['Active', 'Inactive', 'Expired'], default: 'Active' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// ===== Pre-save hook: Auto-generate membershipID & calculate endDate =====
membershipSchema.pre('save', async function (next) {
  if (this.isNew) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'membershipID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.membershipID = `M${String(counter.seq).padStart(5, '0')}`;
  }

  // Auto-expire if needed
  if (this.endDate && this.endDate < new Date()) {
    this.active = false;
    this.status = 'Expired';
  }

  next();
});

module.exports = mongoose.model('Membership', membershipSchema);
