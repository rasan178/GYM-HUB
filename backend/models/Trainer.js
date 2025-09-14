const mongoose = require('mongoose');

// Helper function to calculate duration in minutes
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes > startMinutes ? endMinutes - startMinutes : 0;
}

// Schedule schema with _id disabled
const scheduleSchema = new mongoose.Schema({
  day: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  duration: { type: Number, select: false },
  date: { type: Date }
}, { _id: false });

const trainerSchema = new mongoose.Schema({
  trainerID: { type: String, unique: true },
  trainerName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: String,
  specialty: [{ type: String }],
  experience: String,
  qualifications: String,
  bio: String,
  schedule: [scheduleSchema],
  contactInfo: {
    phone: String,
    address: String
  },
  socialLinks: {
    facebook: String,
    instagram: String,
    linkedin: String
  },
  status: { type: String, default: "Active" }
}, { timestamps: true });

// Auto-increment trainerID & calculate duration
trainerSchema.pre('save', async function (next) {
  if (this.isNew && !this.trainerID) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'trainerID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.trainerID = `TI${String(counter.seq).padStart(4, '0')}`;
  }

  if (this.schedule && this.schedule.length > 0) {
    this.schedule = this.schedule.map(slot => {
      if (slot.startTime && slot.endTime) {
        slot.duration = calculateDuration(slot.startTime, slot.endTime);
      }
      return slot;
    });
  }

  next();
});

module.exports = mongoose.model('Trainer', trainerSchema);
