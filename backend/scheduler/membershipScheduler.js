const cron = require('node-cron');
const Membership = require('../models/Membership');
const Plan = require('../models/Plan');

const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

module.exports = () => {
  cron.schedule('0 0 * * *', async () => { // run daily at midnight
    try {
      const todayStr = formatDate(new Date());

      // 1. Find memberships that are active but past endDate
      const memberships = await Membership.find({
        endDate: { $lt: todayStr },
        status: 'Active'
      });

      for (const membership of memberships) {
        // Skip if admin has deactivated manually
        if (membership.status === 'Inactive') {
          console.log(`[Scheduler] Skipped inactive membership: ${membership.userName}`);
          continue;
        }

        if (membership.renewalOption) {
          // Auto-renew
          const plan = await Plan.findById(membership.planID);
          if (!plan) continue;

          const newStartDate = new Date(membership.endDate);
          newStartDate.setDate(newStartDate.getDate() + 1);

          const newEndDate = new Date(newStartDate);
          newEndDate.setMonth(newEndDate.getMonth() + plan.durationMonths);

          membership.startDate = formatDate(newStartDate);
          membership.endDate = formatDate(newEndDate);
          membership.status = 'Active';
          membership.active = true;
          await membership.save();
          
        } else {
          // No renewal → mark expired
          membership.status = 'Expired';
          membership.active = false;
          await membership.save();
          console.log(`[Scheduler] Expired membership: ${membership.userName} (${membership.endDate})`);
        }
      }

      // 2. Delete old expired memberships (no renewal) after 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const sixMonthsStr = formatDate(sixMonthsAgo);

      const deleted = await Membership.deleteMany({
        endDate: { $lt: sixMonthsStr },
        status: 'Expired',
        renewalOption: false
      });

      if (deleted.deletedCount > 0) {
        console.log(`[Scheduler] Deleted ${deleted.deletedCount} old membership(s)`);
      }

    } catch (err) {
      console.error("[Scheduler] Membership scheduler error:", err.message);
    }
  });
};
