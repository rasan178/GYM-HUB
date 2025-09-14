const cron = require('node-cron');
const Membership = require('../models/Membership');
const Plan = require('../models/Plan');
const User = require('../models/User');

const formatDate = (date) => {
  const d = new Date(date);
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

module.exports = () => {
  // Every second for testing
  cron.schedule('* * * * * *', async () => {
    try {
      const today = new Date();
      const todayStr = formatDate(today);

      // Fetch all memberships with renewalOption true
      const membershipsToRenew = await Membership.find({ renewalOption: true });

      for (const membership of membershipsToRenew) {
        const endDate = new Date(membership.endDate);

        // Only renew if membership expired (or endDate <= today)
        if (endDate <= today) {

          // Expire old membership
          if (membership.status !== 'Expired') {
            membership.status = 'Expired';
            membership.active = false;
            await membership.save();
            console.log(`[Scheduler] Expired membership: ${membership.userName} (${membership.endDate})`);
          }

          // Auto-renew
          const plan = await Plan.findById(membership.planID);
          const user = await User.findById(membership.userID);
          if (!plan || !user) continue;

          const newStartDate = new Date(endDate);
          newStartDate.setDate(endDate.getDate() + 1);

          const newEndDate = new Date(newStartDate);
          newEndDate.setMonth(newEndDate.getMonth() + plan.durationMonths);

          const newStartStr = formatDate(newStartDate);
          const newEndStr = formatDate(newEndDate);

          // Update the existing membership in-place to reflect renewal
          // Avoid creating duplicate active memberships for same plan and startDate
          const existsActive = await Membership.findOne({
            userID: membership.userID,
            planID: plan._id,
            startDate: newStartStr,
            status: 'Active'
          });
          if (existsActive) {
            // If an active membership with the intended new period already exists, skip
            continue;
          }

          // Update fields on the current membership document
          membership.startDate = newStartStr;
          membership.endDate = newEndStr;
          membership.status = 'Active';
          membership.active = true;
          // Keep renewalOption as-is (assume user preference remains)
          // Update plan-related snapshot fields in case plan details changed
          membership.planID = plan._id;
          membership.planName = plan.planName;
          membership.facilitiesIncluded = plan.description;
          membership.price = plan.price;
          membership.duration = `${plan.durationMonths} month(s)`;

          await membership.save();
          console.log(`[Scheduler] Auto-renewed (updated) membership for ${membership.userName}: ${newStartStr} to ${newEndStr}`);
        }
      }

      // Cleanup old memberships (>6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const sixMonthsStr = formatDate(sixMonthsAgo);

      const deleted = await Membership.deleteMany({
        endDate: { $lt: sixMonthsStr },
        status: 'Expired'
      });

      if (deleted.deletedCount > 0) {
        console.log(`[Scheduler] Deleted ${deleted.deletedCount} old membership(s)`);
      }

    } catch (err) {
      console.error("Membership scheduler error:", err.message);
    }
  });
};
