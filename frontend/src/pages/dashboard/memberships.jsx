import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { API_PATHS } from '../../utils/apiPaths';
import { formatDate } from '../../utils/helpers';
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

        {/* Memberships Linear List */}
        {memberships.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No memberships yet</h3>
            <p className="text-gray-500 mb-4">You don't have any memberships. Contact the gym to get started!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Renewal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Facilities
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {memberships.map(membership => {
                    const remainingDays = Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <tr key={membership._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{membership.planName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            membership.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : membership.status === 'Expired'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {membership.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(membership.startDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(membership.endDate)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {remainingDays > 0 ? `${remainingDays} days` : 'Expired'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {membership.renewalOption ? 'Yes' : 'No'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {membership.facilitiesIncluded ? (
                            <ul className="space-y-1">
                              {membership.facilitiesIncluded.split(',').map((facility, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-xs">{facility.trim()}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {memberships.map(membership => {
                const remainingDays = Math.ceil((new Date(membership.endDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={membership._id} className="border-b border-gray-200 p-4 last:border-b-0">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{membership.planName}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        membership.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : membership.status === 'Expired'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {membership.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Start Date:</span>
                        <span className="text-gray-900 font-medium">{formatDate(membership.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">End Date:</span>
                        <span className="text-gray-900 font-medium">{formatDate(membership.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Remaining Days:</span>
                        <span className="text-gray-900 font-medium">
                          {remainingDays > 0 ? `${remainingDays} days` : 'Expired'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Renewal:</span>
                        <span className="text-gray-900 font-medium">{membership.renewalOption ? 'Yes' : 'No'}</span>
                      </div>
                      {membership.facilitiesIncluded && (
                        <div>
                          <span className="text-gray-500 text-sm mb-2 block">Facilities:</span>
                          <ul className="space-y-1 ml-4">
                            {membership.facilitiesIncluded.split(',').map((facility, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-gray-900 font-medium text-sm">{facility.trim()}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Memberships;