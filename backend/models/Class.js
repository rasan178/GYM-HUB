const mongoose = require('mongoose');

// Calculate duration in minutes from startTime and endTime
function calculateDurationFromTimes(startTime, endTime) {
  if (!startTime || !endTime) return 0;

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return endMinutes > startMinutes ? endMinutes - startMinutes : 0;
}

const classSchema = new mongoose.Schema({
  classID: { type: String, unique: true },
  className: { type: String, required: true },
  description: String,
  trainerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer', required: true },

  schedule: [{
    day: { type: String },          // "Mon", "Wed"
    startTime: { type: String },    // "07:00"
    endTime: { type: String },      // "09:00"
    duration: { type: Number },     // auto-calculated
    _id: false
  }],

  capacity: Number,
  location: String,
  price: Number,
  imageURLs: { type: [String], default: [] },
  status: { type: String, default: 'Active' },
  adminDeactivated: { type: Boolean, default: false },
  adminDeactivatedAt: { type: Date },
  category: { type: String },
  level: { 
    type: String, 
    enum: ["Beginner", "Intermediate", "Advanced"], 
    default: "Beginner" 
  },

  cancellations: [{
    _id: false,           // ✅ Disable automatic _id
    date: { type: String, required: true },
    startTime: { type: String },  // optional: will store scheduled start
    endTime: { type: String }     // optional: will store scheduled end
  }]
}, { timestamps: true });

// Unique combination: className + schedule + trainer
classSchema.index(
  { className: 1, "schedule.day": 1, "schedule.startTime": 1, trainerID: 1 },
  { unique: true, sparse: true }
);

// Auto-generate classID and calculate duration
classSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'classID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.classID = `CI${String(counter.seq).padStart(4, '0')}`;
  }

  if (this.schedule && this.schedule.length > 0) {
    this.schedule.forEach(entry => {
      entry.duration = calculateDurationFromTimes(entry.startTime, entry.endTime);
    });
  }

  next();
});

module.exports = mongoose.model('Class', classSchema);
