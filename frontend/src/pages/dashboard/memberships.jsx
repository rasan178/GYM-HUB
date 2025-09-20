import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import MembershipCard from '../../components/Cards/MembershipCard';
import { API_PATHS } from '../../utils/apiPaths';
import SkeletonLoader from '../../components/Loaders/SkeletonLoader';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await api.get(API_PATHS.MEMBERSHIPS.GET_ALL);
      setMemberships(res.data.memberships);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch memberships');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Memberships</h1>
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {memberships.map(m => <MembershipCard key={m._id} membership={m} />)}
      </div>
    </DashboardLayout>
  );
};

export default Memberships;