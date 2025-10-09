import { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { api } from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar, 
  MessageSquare,
  DollarSign,
  AlertCircle,
  Trash2
} from 'lucide-react';

// Reusable SummaryCard component
const SummaryCard = ({ icon: Icon, title, count, iconColor }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{count}</p>
      </div>
    </div>
  </div>
);

// Reusable DeleteButton component
const DeleteButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
    title="Delete request"
  >
    <Trash2 className="w-4 h-4" />
  </button>
);

const AdminMembershipRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get(API_PATHS.MEMBERSHIP_REQUESTS.ADMIN.GET_ALL);
      // Backend returns { total, page, limit, requests: [...] }
      setRequests(res.data.requests || []);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch membership requests');
      setRequests([]); // Set empty array on error
    }
  };

  const handleAction = async (requestId, action, confirmMessage, successMessage, apiCall) => {
    if (!confirm(confirmMessage)) return;
    
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await apiCall(requestId);
      fetchRequests();
      alert(successMessage);
    } catch (err) {
      setLocalError(err.response?.data?.message || `Failed to ${action} request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = (requestId) => handleAction(
    requestId,
    'approve',
    'Are you sure you want to approve this membership request?',
    'Membership request approved successfully!',
    (id) => api.patch(API_PATHS.MEMBERSHIP_REQUESTS.ADMIN.APPROVE(id))
  );

  const handleReject = (requestId) => handleAction(
    requestId,
    'reject',
    'Are you sure you want to reject this membership request?',
    'Membership request rejected successfully!',
    (id) => api.patch(API_PATHS.MEMBERSHIP_REQUESTS.ADMIN.REJECT(id))
  );

  const handleDelete = (requestId) => handleAction(
    requestId,
    'delete',
    'Are you sure you want to delete this membership request? This action cannot be undone.',
    'Membership request deleted successfully!',
    (id) => api.delete(API_PATHS.MEMBERSHIP_REQUESTS.ADMIN.DELETE(id))
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      Pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      Approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      Rejected: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig.Pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  // Memoize filter calculations to avoid recalculating on every render
  const requestCounts = useMemo(() => ({
    total: requests.length,
    pending: requests.filter(r => r.status === 'Pending').length,
    approved: requests.filter(r => r.status === 'Approved').length,
    rejected: requests.filter(r => r.status === 'Rejected').length
  }), [requests]);

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return requests || [];
    return (requests || []).filter(request => request.status === filter);
  }, [requests, filter]);


  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Membership Requests</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-white">Filter:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-white rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Requests</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className="text-sm text-white">
              Total: {requestCounts.total} | Pending: {requestCounts.pending}
            </div>
          </div>
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {localError}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={User}
            title="Total Requests"
            count={requestCounts.total}
            iconColor="text-blue-500"
          />
          <SummaryCard
            icon={Clock}
            title="Pending Requests"
            count={requestCounts.pending}
            iconColor="text-yellow-500"
          />
          <SummaryCard
            icon={CheckCircle}
            title="Approved Requests"
            count={requestCounts.approved}
            iconColor="text-green-500"
          />
          <SummaryCard
            icon={XCircle}
            title="Rejected Requests"
            count={requestCounts.rejected}
            iconColor="text-red-500"
          />
        </div>

        {filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No membership requests found</h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'No membership requests have been submitted yet.'
                : `No ${filter} membership requests found.`
              }
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Requested Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map(request => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.userID?.name || request.userName || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {request.userID?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.planID?.planName || request.planName || 'Unknown Plan'}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {request.planID?.price || 'N/A'}/month
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          {request.planID?.durationMonths || 'N/A'} month(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.requestedStartDate ? new Date(request.requestedStartDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Submitted: {new Date(request.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          {request.message ? (
                            <div className="flex items-start">
                              <MessageSquare className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="truncate">{request.message}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">No message</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {request.status === 'Pending' ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleApprove(request._id)}
                              disabled={isSubmitting}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request._id)}
                              disabled={isSubmitting}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Reject
                            </button>
                            <DeleteButton
                              onClick={() => handleDelete(request._id)}
                              disabled={isSubmitting}
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col space-y-1">
                            <span className="text-gray-500 text-xs">
                              {request.status === 'Approved' ? 'Already Approved' : 'Already Rejected'}
                              {request.processedAt && (
                                <div className="text-gray-400 mt-1">
                                  {new Date(request.processedAt).toLocaleDateString()}
                                </div>
                              )}
                            </span>
                            <DeleteButton
                              onClick={() => handleDelete(request._id)}
                              disabled={isSubmitting}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMembershipRequests;