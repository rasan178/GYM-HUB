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
  // Run every day at midnight to check for expired memberships
  cron.schedule('0 0 * * *', async () => {
    try {
      const today = new Date();
      const todayStr = formatDate(today);

      console.log(`[Membership Scheduler] Running at ${todayStr}`);

      // Fetch all active memberships
      const activeMemberships = await Membership.find({ 
        status: 'Active', 
        active: true 
      });

      for (const membership of activeMemberships) {
        const endDate = new Date(membership.endDate);

        // Check if membership has expired
        if (endDate < today) {
          membership.status = 'Expired';
          membership.active = false;
          await membership.save();
          
          console.log(`[Membership Scheduler] Expired membership: ${membership.userName} (${membership.membershipID})`);
        }
      }

      // Auto-renew memberships with renewalOption enabled
      const membershipsToRenew = await Membership.find({ 
        renewalOption: true, 
        status: 'Expired' 
      });

      for (const membership of membershipsToRenew) {
        const endDate = new Date(membership.endDate);
        
        // Only renew if membership expired today or recently
        const daysSinceExpiry = Math.floor((today - endDate) / (1000 * 60 * 60 * 24));
        
        if (daysSinceExpiry <= 7) { // Allow renewal within 7 days of expiry
          const plan = await Plan.findById(membership.planID);
          const user = await User.findById(membership.userID);
          
          if (!plan || !user) {
            console.log(`[Membership Scheduler] Skipping renewal - plan or user not found for ${membership.membershipID}`);
            continue;
          }

          const newStartDate = new Date(endDate);
          newStartDate.setDate(endDate.getDate() + 1);

          const newEndDate = new Date(newStartDate);
          newEndDate.setMonth(newEndDate.getMonth() + plan.durationMonths);

          const newStartStr = formatDate(newStartDate);
          const newEndStr = formatDate(newEndDate);

          // Check if renewal already exists
          const existingRenewal = await Membership.findOne({
            userID: membership.userID,
            planID: plan._id,
            startDate: newStartStr,
            status: 'Active'
          });

          if (existingRenewal) {
            console.log(`[Membership Scheduler] Renewal already exists for ${membership.userName}`);
            continue;
          }

          // Update the membership for renewal
          membership.startDate = newStartStr;
          membership.endDate = newEndStr;
          membership.status = 'Active';
          membership.active = true;
          membership.planName = plan.planName;
          membership.facilitiesIncluded = plan.description;
          membership.price = plan.price;
          membership.duration = `${plan.durationMonths} month(s)`;

          await membership.save();
          console.log(`[Membership Scheduler] Auto-renewed membership for ${membership.userName}: ${newStartStr} to ${newEndStr}`);
        }
      }

      // Cleanup old expired memberships (older than 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const sixMonthsStr = formatDate(sixMonthsAgo);

      const deleted = await Membership.deleteMany({
        endDate: { $lt: sixMonthsStr },
        status: 'Expired',
        active: false
      });

      if (deleted.deletedCount > 0) {
        console.log(`[Membership Scheduler] Cleaned up ${deleted.deletedCount} old expired membership(s)`);
      }

    } catch (err) {
      console.error("[Membership Scheduler] Error:", err.message);
    }
  });
};
