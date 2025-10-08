import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import MembershipCard from '../../components/Cards/MembershipCard';
import { API_PATHS } from '../../utils/apiPaths';
import BlackSkeletonLoader from '../../components/Loaders/BlackSkeletonLoader';
import { 
  Award, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';

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

  if (isLoading) return <BlackSkeletonLoader lines={8} />;

  // Calculate membership statistics
  const activeMemberships = memberships.filter(m => m.status === 'Active').length;
  const expiredMemberships = memberships.filter(m => m.status === 'Expired').length;
  const totalMemberships = memberships.length;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Memberships</h1>
          <p className="text-white/70">View and manage your gym memberships</p>
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            {localError}
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Memberships</p>
                <p className="text-2xl font-bold text-gray-900">{totalMemberships}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Memberships</p>
                <p className="text-2xl font-bold text-gray-900">{activeMemberships}</p>
                <p className="text-xs text-gray-500 mt-1">Currently active</p>
              </div>
              <div className="p-3 rounded-full bg-green-500">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired Memberships</p>
                <p className="text-2xl font-bold text-gray-900">{expiredMemberships}</p>
                <p className="text-xs text-gray-500 mt-1">Past memberships</p>
              </div>
              <div className="p-3 rounded-full bg-red-500">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Memberships Grid */}
        {memberships.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No memberships yet</h3>
            <p className="text-gray-500 mb-4">You don't have any memberships. Contact the gym to get started!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Membership Details</h2>
              <p className="text-gray-600">Your current and past memberships</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {memberships.map(m => <MembershipCard key={m._id} membership={m} />)}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Memberships;