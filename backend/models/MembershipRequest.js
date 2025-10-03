const mongoose = require('mongoose');

const membershipRequestSchema = new mongoose.Schema({
  requestID: { type: String, unique: true }, // Auto-generated
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String }, // auto-filled from Users collection
  planID: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  planName: { type: String }, // auto-filled from Plans collection
  requestedStartDate: { type: String, required: true }, // user requested start date
  message: { type: String, trim: true }, // optional message from user
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'], 
    default: 'Pending' 
  },
  adminNotes: { type: String, trim: true }, // admin can add notes
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // admin who processed
  processedAt: { type: Date },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook to auto-generate requestID
membershipRequestSchema.pre('save', async function (next) {
  if (this.isNew) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'membershipRequestID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.requestID = `MR${String(counter.seq).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('MembershipRequest', membershipRequestSchema);

