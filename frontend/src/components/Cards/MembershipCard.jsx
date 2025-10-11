import { formatDate } from '../../utils/helpers';
import MembershipRenewalToggle from '../MembershipRenewalToggle';

const MembershipCard = ({ membership, onUpdate }) => {
  const remainingDays = Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return (
    <div className="border-2 border-black bg-white text-black shadow-lg hover:shadow-2xl transition-all">
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black uppercase tracking-wide">{membership.planName}</h2>
          <span className={`px-3 py-1 text-xs font-black border-2 ${membership.active ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}>
            {membership.active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm font-bold">
          <div className="border-2 border-black px-3 py-2 bg-white">User: {membership.userName}</div>
          <div className="border-2 border-black px-3 py-2 bg-white">Status: {membership.status}</div>
          <div className="border-2 border-black px-3 py-2 bg-white">Start: {formatDate(membership.startDate)}</div>
          <div className="border-2 border-black px-3 py-2 bg-white">End: {formatDate(membership.endDate)}</div>
          <div className="border-2 border-black px-3 py-2 bg-white flex items-center justify-between">
            <span>Auto Renewal:</span>
            <MembershipRenewalToggle
              membership={membership}
              onUpdate={onUpdate}
              size="sm"
              showLabel={false}
            />
          </div>
          <div className="border-2 border-black px-3 py-2 bg-white">Remaining: {remainingDays > 0 ? `${remainingDays} days` : 'Expired'}</div>
        </div>
        {membership.facilitiesIncluded && (
          <div className="border-2 border-black px-3 py-2 bg-white text-sm font-bold">
            Facilities: {membership.facilitiesIncluded}
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipCard;