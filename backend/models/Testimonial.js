const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  testimonialID: { type: String, unique: true },
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true }, // now user provides
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  imageURL: String, // Keep for backward compatibility
  imageURLs: [{ type: String }], // New field for multiple images (max 5)
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true }); // createdAt and updatedAt auto

// Auto-generate testimonialID
testimonialSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'testimonialID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.testimonialID = `TI${String(counter.seq).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Testimonial', testimonialSchema);
