import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { API_PATHS } from '../../utils/apiPaths';
import { formatDate } from '../../utils/helpers';
import { 
  Award, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  Search,
  Info,
  FileText
} from 'lucide-react';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [membershipRequests, setMembershipRequests] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [hoveredFacilities, setHoveredFacilities] = useState(null);
  const [hoveredDescription, setHoveredDescription] = useState(null);

  useEffect(() => {
    fetchMemberships();
    fetchMembershipRequests();
  }, []);

  const fetchMemberships = async () => {
    try {
      const res = await api.get(API_PATHS.MEMBERSHIPS.GET_ALL);
      setMemberships(res.data.memberships);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch memberships');
    }
  };

  const fetchMembershipRequests = async () => {
    try {
      const res = await api.get(API_PATHS.MEMBERSHIP_REQUESTS.GET_MY);
      setMembershipRequests(res.data.requests || []);
    } catch (err) {
      console.error('Failed to fetch membership requests:', err);
      setMembershipRequests([]);
    }
  };


  // Calculate membership statistics
  const activeMemberships = memberships.filter(m => m.status === 'Active').length;
  const expiredMemberships = memberships.filter(m => m.status === 'Expired').length;
  const totalMemberships = memberships.length;
  const pendingRequests = membershipRequests.filter(r => r.status === 'Pending').length;
  const totalRequests = membershipRequests.length;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500">
                <FileText className="w-6 h-6 text-white" />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Plan Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Remaining Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Renewal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
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
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 relative">
                            {membership.description ? (
                              <div className="max-w-xs">
                                {membership.description.length > 100 ? (
                                  <div className="relative">
                                    <p className="line-clamp-3 cursor-pointer" 
                                       onMouseEnter={() => setHoveredDescription(membership._id)}
                                       onMouseLeave={() => setHoveredDescription(null)}>
                                      {membership.description}
                                    </p>
                                    
                                    {/* Description Tooltip */}
                                    {hoveredDescription === membership._id && (
                                      <div className="absolute z-10 bottom-full left-0 mb-2 w-80 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3">
                                        <div className="font-semibold text-white mb-2">Plan Description:</div>
                                        <p className="leading-relaxed">{membership.description}</p>
                                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    )}
                                    
                                    <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                      <Info className="w-3 h-3" />
                                      +{membership.description.length - 100} more characters
                                    </div>
                                  </div>
                                ) : (
                                  <p className="line-clamp-3">{membership.description}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic">No description available</span>
                            )}
                          </div>
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
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 relative">
                            {membership.facilitiesIncluded ? (
                              <div className="space-y-1 max-w-sm">
                                {membership.facilitiesIncluded.split(',').slice(0, 4).map((facility, index) => (
                                  <div key={index} className="flex items-start">
                                    <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs leading-relaxed">{facility.trim()}</span>
                                  </div>
                                ))}
                                {membership.facilitiesIncluded.split(',').length > 4 && (
                                  <div className="relative">
                                    <button
                                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                                      onMouseEnter={() => setHoveredFacilities(membership._id)}
                                      onMouseLeave={() => setHoveredFacilities(null)}
                                    >
                                      <Info className="w-3 h-3" />
                                      +{membership.facilitiesIncluded.split(',').length - 4} more facilities
                                    </button>
                                    
                                    {/* Facilities Tooltip */}
                                    {hoveredFacilities === membership._id && (
                                      <div className="absolute z-10 bottom-full left-0 mb-2 w-80 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3">
                                        <div className="space-y-2">
                                          <div className="font-semibold text-white mb-2">All Facilities:</div>
                                          {membership.facilitiesIncluded.split(',').map((facility, index) => (
                                            <div key={index} className="flex items-start">
                                              <CheckCircle className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                              <span className="leading-relaxed">{facility.trim()}</span>
                                            </div>
                                          ))}
                                        </div>
                                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 italic text-xs">No facilities listed</span>
                            )}
                          </div>
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
                      <div>
                        <h3 className="font-semibold text-gray-900">{membership.planName}</h3>
                        <p className="text-xs text-gray-500">ID: {membership.membershipID}</p>
                      </div>
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
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{formatDate(membership.startDate)} - {formatDate(membership.endDate)}</span>
                      </div>
                      
                      <div className="flex items-center text-sm">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">
                          {remainingDays > 0 ? `${remainingDays} days remaining` : 'Expired'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Description: </span>
                        {membership.description ? (
                          <>
                            <span className={`${membership.description.length > 80 ? 'line-clamp-2' : ''}`}>
                              {membership.description}
                            </span>
                            {membership.description.length > 80 && (
                              <div className="text-xs text-blue-600 mt-1">
                                +{membership.description.length - 80} more characters
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-500 italic">No description available</span>
                        )}
                      </div>
                      
                      {membership.facilitiesIncluded && (
                        <div className="text-sm">
                          <span className="font-medium text-gray-900">Facilities:</span>
                          <div className="mt-1 space-y-1">
                            {membership.facilitiesIncluded.split(',').slice(0, 3).map((facility, index) => (
                              <div key={index} className="flex items-start">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-xs">{facility.trim()}</span>
                              </div>
                            ))}
                            {membership.facilitiesIncluded.split(',').length > 3 && (
                              <div className="text-xs text-blue-600">
                                +{membership.facilitiesIncluded.split(',').length - 3} more facilities
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500">Renewal: </span>
                        <span className="font-medium">{membership.renewalOption ? 'Yes' : 'No'}</span>
                      </div>
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