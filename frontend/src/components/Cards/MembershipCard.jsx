import { formatDate } from '../../utils/helpers';

const MembershipCard = ({ membership }) => {
  const remainingDays = Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24));
  return (
    <div className="card w-full md:w-96 bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">{membership.planName}</h2>
        <p>User: {membership.userName}</p>
        <p>Start: {formatDate(membership.startDate)}</p>
        <p>End: {formatDate(membership.endDate)}</p>
        <p>Remaining Days: {remainingDays > 0 ? remainingDays : 'Expired'}</p>
        <p>Status: {membership.status}</p>
        <p>Facilities: {membership.facilitiesIncluded}</p>
        <p>Renewal: {membership.renewalOption ? 'Yes' : 'No'}</p>
        <p>Active: {membership.active ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default MembershipCard;