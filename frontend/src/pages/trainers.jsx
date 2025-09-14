import { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import MainLayout from '../components/Layouts/MainLayout';
import TrainerCard from '../components/Cards/TrainerCard';
import { API_PATHS } from '../utils/apiPaths';
import SkeletonLoader from '../components/Loaders/SkeletonLoader';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Trainers</h1>
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {trainers.map(t => <TrainerCard key={t._id} trainer={t} />)}
      </div>
    </MainLayout>
  );
};

export default Trainers;