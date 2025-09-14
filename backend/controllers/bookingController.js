const Booking = require('../models/Booking');
const User = require('../models/User');
const Class = require('../models/Class');
const Trainer = require('../models/Trainer');
const Counter = require('../models/Counter');

// ------------------ Helper: Generate bookingID ------------------
async function generateBookingID() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'bookingID' },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `BI${String(counter.seq).padStart(6, '0')}`;
}

// ------------------ CREATE BOOKING ------------------
exports.createBooking = async (req, res) => {
  try {
    // NOTE: added startTime to destructuring for personal bookings
    const { bookingType, classID, trainerID, date, startTime, endTime, goal } = req.body;
    const userID = req.user._id;

    // Validate user
    const user = await User.findById(userID);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!bookingType || !['class', 'personal'].includes(bookingType)) {
      return res.status(400).json({ message: 'bookingType must be either "class" or "personal"' });
    }

    let bookingData = { userID, bookingType };

    // ----------- Class Booking Logic -----------
    if (bookingType === 'class') {
      if (!classID || !date)
        return res.status(400).json({ message: 'classID and date are required' });

      const gymClass = await Class.findById(classID);
      if (!gymClass) return res.status(404).json({ message: 'Class not found' });

      // Get weekday from date
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

      // Find schedule for that day
      const scheduleSlot = gymClass.schedule.find(s => s.day === dayOfWeek);
      if (!scheduleSlot) return res.status(400).json({ message: 'No class scheduled on this day' });

      // Cancel check
      const isCancelled = (gymClass.cancellations || []).some(
        c => c.date === date && c.startTime === scheduleSlot.startTime
      );
      if (isCancelled) return res.status(400).json({ message: 'This class is cancelled on the selected date' });

      // Capacity check
      const bookedCount = await Booking.countDocuments({
        classID,
        date: date, // <-- fixed
        startTime: scheduleSlot.startTime,
        bookingStatus: { $ne: 'Cancelled' }
      });
      if (gymClass.capacity && bookedCount >= gymClass.capacity)
        return res.status(400).json({ message: 'Class is fully booked' });

      // Duplicate check
      const alreadyBooked = await Booking.findOne({
        userID,
        classID,
        date: date, // <-- fixed
        startTime: scheduleSlot.startTime,
        bookingStatus: { $ne: 'Cancelled' }
      });
      if (alreadyBooked) return res.status(400).json({ message: 'You already booked this class' });

      bookingData = {
        ...bookingData,
        classID,
        trainerID: gymClass.trainerID,
        date, // <-- using `date` consistently
        startTime: scheduleSlot.startTime,
        endTime: scheduleSlot.endTime,
        duration: scheduleSlot.duration
      };
    }

    // ----------- Personal Training Booking Logic -----------
    if (bookingType === 'personal') {
      // For personal booking we require trainerID, date, startTime and endTime from the request
      if (!trainerID || !date || !startTime || !endTime)
        return res.status(400).json({ message: 'trainerID, date, startTime, and endTime are required' });

      const trainer = await Trainer.findById(trainerID);
      if (!trainer) return res.status(404).json({ message: 'Trainer not found' });

      // Check trainer conflict (using `date` and the provided startTime)
      const trainerConflict = await Booking.findOne({
        trainerID,
        date: date, // <-- fixed
        startTime: startTime,
        bookingStatus: { $ne: 'Cancelled' }
      });
      if (trainerConflict) return res.status(400).json({ message: 'Trainer is already booked at this time' });

      // Check duplicate booking for same user
      const userConflict = await Booking.findOne({
        userID,
        trainerID,
        date: date, // <-- fixed
        startTime: startTime,
        bookingStatus: { $ne: 'Cancelled' }
      });
      if (userConflict) return res.status(400).json({ message: 'You already booked this trainer at this time' });

      // Duration auto-calc
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      const duration = (endH * 60 + endM) - (startH * 60 + startM);
      if (duration <= 0) return res.status(400).json({ message: 'Invalid time range' });

      bookingData = {
        ...bookingData,
        trainerID,
        date, // <-- using `date` consistently
        startTime,
        endTime,
        duration,
        goal
      };
    }

    // Generate bookingID (controller-level) — model also has pre-save fallback
    const bookingID = await generateBookingID();
    bookingData.bookingID = bookingID;

    const booking = await Booking.create(bookingData);
    res.status(201).json({ message: 'Booking created successfully', booking });

  } catch (error) {
    res.status(500).json({ message: 'Error creating booking', error: error.message });
  }
};

// ------------------ GET ALL BOOKINGS ------------------
exports.getBookings = async (req, res) => {
  try {
    const filter = req.user.isAdmin ? {} : { userID: req.user._id };
    const bookings = await Booking.find(filter)
      .populate('userID', 'name email')
      .populate('trainerID', 'trainerName specialty')
      .populate('classID', 'className schedule capacity');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings', error: error.message });
  }
};

// ------------------ GET SINGLE BOOKING ------------------
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userID', 'name email')
      .populate('trainerID', 'trainerName specialty')
      .populate('classID', 'className schedule capacity');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching booking', error: error.message });
  }
};

// ------------------ CANCEL BOOKING ------------------
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (!req.user.isAdmin && booking.userID.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'You can only cancel your own booking' });

    if (booking.bookingStatus === 'Cancelled')
      return res.status(400).json({ message: 'Booking is already cancelled' });

    booking.bookingStatus = 'Cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error cancelling booking', error: error.message });
  }
};

// ------------------ UPDATE BOOKING STATUS (ADMIN) ------------------
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const { bookingStatus } = req.body;
    const validStatuses = ['Confirmed', 'Cancelled']; // ✅ Removed "Completed"
    if (!validStatuses.includes(bookingStatus))
      return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });

    booking.bookingStatus = bookingStatus;
    await booking.save();
    res.json({ message: `Booking status updated to ${bookingStatus}`, booking });
  } catch (error) {
    res.status(500).json({ message: 'Error updating booking status', error: error.message });
  }
};

// ------------------ UPDATE BOOKING ------------------
exports.updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const {
      classID,
      trainerID,
      date,
      startTime,
      endTime,
      goal,
      bookingStatus
    } = req.body;

    // ---------------- Prevent past date updates ----------------
    if (date) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // ignore time
      const newDate = new Date(date);
      if (newDate < today) {
        return res.status(400).json({ message: 'Cannot update booking to a past date' });
      }
    }

    // ---------------- Permission Check ----------------
    if (!req.user.isAdmin) {
      if (booking.userID.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You can only update your own booking' });
      }
      if (booking.bookingStatus === 'Cancelled' || booking.bookingStatus === 'Completed') {
        return res.status(400).json({ message: 'Cannot update cancelled or completed bookings' });
      }
    } else {
      // Admin cannot update completed bookings
      if (booking.bookingStatus === 'Completed') {
        return res.status(400).json({ message: 'Cannot update completed bookings' });
      }
      // Admin can update status (except completed)
      if (bookingStatus) {
        const validStatuses = ['Pending', 'Confirmed', 'Cancelled'];
        if (!validStatuses.includes(bookingStatus)) {
          return res.status(400).json({ message: `bookingStatus must be one of: ${validStatuses.join(', ')}` });
        }
        booking.bookingStatus = bookingStatus;
      }
    }

    // ---------------- Class Booking Update ----------------
    if (booking.bookingType === 'class' && classID) {
      const cls = await Class.findById(classID);
      if (!cls) return res.status(404).json({ message: 'Class not found' });
      booking.classID = cls._id;
      booking.trainerID = cls.trainerID;
    }

    if (booking.bookingType === 'class' && date) {
      const cls = await Class.findById(booking.classID);
      if (!cls) return res.status(404).json({ message: 'Class not found for the booking' });

      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
      const scheduleSlot = cls.schedule.find(s => s.day === dayOfWeek);
      if (!scheduleSlot) return res.status(400).json({ message: 'No class scheduled on this day' });

      const bookedCount = await Booking.countDocuments({
        classID: booking.classID,
        date: date,
        startTime: scheduleSlot.startTime,
        bookingStatus: { $ne: 'Cancelled' },
        _id: { $ne: booking._id }
      });
      if (cls.capacity && bookedCount >= cls.capacity)
        return res.status(400).json({ message: 'Class is fully booked' });

      booking.date = date;
      booking.startTime = scheduleSlot.startTime;
      booking.endTime = scheduleSlot.endTime;
      booking.duration = scheduleSlot.duration;
    }

    // ---------------- Personal Training Update ----------------
    if (booking.bookingType === 'personal' && trainerID) {
      const trainer = await Trainer.findById(trainerID);
      if (!trainer) return res.status(404).json({ message: 'Trainer not found' });
      booking.trainerID = trainer._id;
    }

    if (booking.bookingType === 'personal' && date) {
      booking.date = date;

      // Update times only if both provided
      if (startTime && endTime) {
        const trainerConflict = await Booking.findOne({
          trainerID: booking.trainerID,
          date: date,
          startTime: startTime,
          bookingStatus: { $ne: 'Cancelled' },
          _id: { $ne: booking._id }
        });
        if (trainerConflict) return res.status(400).json({ message: 'Trainer is already booked at this time' });

        booking.startTime = startTime;
        booking.endTime = endTime;
        booking.duration =
          (+endTime.split(':')[0] * 60 + +endTime.split(':')[1]) -
          (+startTime.split(':')[0] * 60 + +startTime.split(':')[1]);
      }

      if (goal) booking.goal = goal;
    }

    await booking.save();
    res.json({ message: 'Booking updated successfully', booking });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ------------------ DELETE BOOKING (Admin Only) ------------------
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    await booking.deleteOne();
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
