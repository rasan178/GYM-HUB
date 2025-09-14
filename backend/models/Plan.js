const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planID: { type: String, unique: true },           // Auto-generated
  planName: { type: String, required: true, trim: true, unique: true },
  description: { type: String, trim: true },
  price: { type: Number, required: true, min: 0 },
  durationMonths: { type: Number, required: true, min: 1 }
}, { timestamps: true });

// Pre-save hook to auto-generate planID
planSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'planID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.planID = `PI${String(counter.seq).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Plan', planSchema);
