const cron = require('node-cron');
const Booking = require('../models/Booking');

// Helper: format date as YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

module.exports = () => {
  // Run every day at midnight (production)
  cron.schedule('0 0 * * *', async () => {
    try {
      const todayStr = formatDate(new Date());

      // 1. Mark past bookings as Completed
      const bookingResult = await Booking.updateMany(
        { date: { $lt: todayStr }, bookingStatus: { $nin: ['Completed', 'Cancelled'] } },
        { bookingStatus: 'Completed' }
      );
      if (bookingResult.modifiedCount > 0) {
        console.log(`${bookingResult.modifiedCount} booking(s) marked as Completed`);
      }

      // 2. Cleanup old bookings (>12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const twelveMonthsStr = formatDate(twelveMonthsAgo);

      const deleted = await Booking.deleteMany({
        $or: [
          { bookingStatus: 'Cancelled', createdDate: { $lt: twelveMonthsStr } },
          { bookingStatus: 'Completed', createdDate: { $lt: twelveMonthsStr } }
        ]
      });
      if (deleted.deletedCount > 0) {
        console.log(`Deleted ${deleted.deletedCount} old booking(s)`);
      }

    } catch (err) {
      console.error("Booking scheduler error:", err.message);
    }
  });
};
