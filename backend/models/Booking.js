const mongoose = require('mongoose');

// Helper: calculate duration in minutes
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  return endMinutes > startMinutes ? endMinutes - startMinutes : 0;
}

const bookingSchema = new mongoose.Schema({
  bookingID: { type: String, unique: true },

  bookingType: { 
    type: String, 
    enum: ['class', 'personal'], 
    required: true 
  },

  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // For class bookings
  classID: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },

  // For both: auto-filled for class, manually chosen for personal
  trainerID: { type: mongoose.Schema.Types.ObjectId, ref: 'Trainer' },

  // Shared fields
  date: { type: String, required: true }, // "YYYY-MM-DD" (renamed from classDate to be consistent)
  startTime: { type: String, required: true }, // "HH:mm"
  endTime: { type: String },                   
  duration: { type: Number },                  // in minutes (auto-filled)

  // For personal training
  goal: { type: String }, // training reason

  bookingStatus: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], 
    default: 'Pending' 
  },

  createdDate: { type: String } // store "YYYY-MM-DD"
}, {
  timestamps: true
});

// Auto-generate bookingID and createdDate
bookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const Counter = mongoose.model('Counter');
    const counter = await Counter.findOneAndUpdate(
      { name: 'bookingID' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.bookingID = `BI${String(counter.seq).padStart(6, '0')}`;

    // Set createdDate = YYYY-MM-DD
    const now = new Date();
    this.createdDate = now.toISOString().split("T")[0];
  }

  // Auto-calc duration for personal training
  if (this.bookingType === 'personal' && this.startTime && this.endTime) {
    this.duration = calculateDuration(this.startTime, this.endTime);
  }

  next();
});

// Prevent duplicate bookings
bookingSchema.index(
  { userID: 1, classID: 1, date: 1, startTime: 1 },
  { unique: true, sparse: true } // prevents same user booking same class twice
);

bookingSchema.index(
  { userID: 1, trainerID: 1, date: 1, startTime: 1 },
  { unique: true, sparse: true } // prevents same user booking same trainer session twice
);

module.exports = mongoose.model('Booking', bookingSchema);
