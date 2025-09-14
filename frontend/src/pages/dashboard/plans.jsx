import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../utils/axiosInstance';
import MainLayout from '../../components/Layouts/MainLayout';
import MembershipCard from '../../components/Cards/MembershipCard';
import { API_PATHS } from '../../utils/apiPaths';
import SkeletonLoader from '../../components/Loaders/SkeletonLoader';
import { useRouter } from 'next/router';

const Plans = () => {
  const { user, loading, error } = useContext(AuthContext);
  const [memberships, setMemberships] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    else if (user) fetchMemberships();
  }, [user, loading]);

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

  if (loading || isLoading) return <SkeletonLoader />;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">My Memberships</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {memberships.map(m => <MembershipCard key={m._id} membership={m} />)}
      </div>
    </MainLayout>
  );
};

export default Plans;