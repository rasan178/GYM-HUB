import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import MembershipRenewalToggle from '../../components/MembershipRenewalToggle';
import { formatDate } from '../../utils/helpers';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  User, 
  CreditCard,
  CheckCircle,
  XCircle,
  Users,
  X,
  Info,
  AlertTriangle,
  Power,
  PowerOff,
  Clock
} from 'lucide-react';

const AdminMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [membershipStats, setMembershipStats] = useState({
    totalMemberships: 0,
    activeMemberships: 0,
    inactiveMemberships: 0,
    expiredMemberships: 0
  });
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ userID: '', planID: '', startDate: '', renewalOption: true });
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMemberships();
    fetchUsers();
    fetchPlans();
    fetchMembershipStats();
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

  const fetchUsers = async () => {
    try {
      const res = await api.get(API_PATHS.ADMIN.USERS.GET_ALL);
      setUsers(res.data.map(u => ({ value: u._id, label: u.name })));
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch users');
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get(API_PATHS.PLANS.GET_ALL);
      setPlans(res.data.map(p => ({ value: p._id, label: p.planName })));
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch plans');
    }
  };

  const fetchMembershipStats = async () => {
    try {
      const res = await api.get(API_PATHS.MEMBERSHIPS.GET_STATS);
      setMembershipStats(res.data);
    } catch (err) {
      console.error('Failed to fetch membership statistics:', err);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const createOrUpdate = async () => {
    setIsSubmitting(true);
    try {
      if (formData._id) {
        await api.put(API_PATHS.ADMIN.MEMBERSHIPS.UPDATE(formData._id), formData);
      } else {
        await api.post(API_PATHS.ADMIN.MEMBERSHIPS.CREATE, formData);
      }
      setIsModalOpen(false);
      setFormData({ userID: '', planID: '', startDate: '', renewalOption: true });
      fetchMemberships();
      fetchMembershipStats();
      setLocalError(null);
      alert('Membership saved successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to save membership');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deactivateMembership = async (id) => {
    setIsSubmitting(true);
    try {
      await api.patch(API_PATHS.ADMIN.MEMBERSHIPS.DEACTIVATE(id));
      fetchMemberships();
      fetchMembershipStats();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to deactivate membership');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reactivateMembership = async (id) => {
    setIsSubmitting(true);
    try {
      await api.patch(API_PATHS.ADMIN.MEMBERSHIPS.REACTIVATE(id));
      fetchMemberships();
      fetchMembershipStats();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to reactivate membership');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMembership = async (id) => {
    setIsSubmitting(true);
    try {
      await api.delete(API_PATHS.ADMIN.MEMBERSHIPS.DELETE(id));
      fetchMemberships();
      fetchMembershipStats();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete membership');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRenewalOption = async (id, newRenewalOption) => {
    setIsSubmitting(true);
    try {
      await api.put(API_PATHS.ADMIN.MEMBERSHIPS.UPDATE(id), { renewalOption: newRenewalOption });
      fetchMemberships();
      fetchMembershipStats();
      setLocalError(null);
      alert(`Renewal option ${newRenewalOption ? 'enabled' : 'disabled'} successfully!`);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to update renewal option');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMembershipUpdate = (updatedMembership) => {
    setMemberships(prevMemberships => 
      prevMemberships.map(membership => 
        membership._id === updatedMembership._id ? updatedMembership : membership
      )
    );
    fetchMembershipStats();
  };

  const edit = m => {
    setFormData({
      _id: m._id,
      userID: m.userID,
      planID: m.planID,
      startDate: m.startDate,
      renewalOption: m.renewalOption
    });
    setIsModalOpen(true);
  };

  const getStatusColor = (status, active) => {
    if (!active) return 'bg-gray-100 text-gray-800 border-gray-200';
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800 border-green-200';
      case 'Expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status, active) => {
    if (!active) return <XCircle className="w-4 h-4" />;
    switch (status) {
      case 'Active': return <CheckCircle className="w-4 h-4" />;
      case 'Expired': return <XCircle className="w-4 h-4" />;
      case 'Pending': return <Info className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };


  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Membership Management</h1>
            <p className="text-white mt-1">Manage gym memberships and subscriptions</p>
          </div>
          <button
            onClick={() => { setFormData({ userID: '', planID: '', startDate: '', renewalOption: true }); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Membership
          </button>
        </div>

        {/* Membership Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Memberships</dt>
                  <dd className="text-lg font-medium text-gray-900">{membershipStats.totalMemberships}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Memberships</dt>
                  <dd className="text-lg font-medium text-gray-900">{membershipStats.activeMemberships}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive Memberships</dt>
                  <dd className="text-lg font-medium text-gray-900">{membershipStats.inactiveMemberships}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Expired Memberships</dt>
                  <dd className="text-lg font-medium text-gray-900">{membershipStats.expiredMemberships}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {localError}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {memberships.map(m => (
              <div key={m._id} className="border-b border-gray-200 p-4 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {m.userName}
                    </h3>
                    <p className="text-xs text-gray-500">{m.planName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(m.status, m.active)}`}>
                      {getStatusIcon(m.status, m.active)}
                      {m.active ? m.status : 'Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Plan: {m.planName}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Start: {m.startDate ? formatDate(m.startDate) : 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>End: {m.endDate ? formatDate(m.endDate) : 'N/A'}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Info className="w-4 h-4 mr-2 text-gray-400" />
                    <span>Renewal: {m.renewalOption ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => edit(m)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {m.active ? (
                      <button
                        onClick={() => deactivateMembership(m._id)}
                        disabled={isSubmitting}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                        title="Deactivate membership"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => reactivateMembership(m._id)}
                        disabled={isSubmitting}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                        title="Reactivate membership"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                    <MembershipRenewalToggle
                      membership={m}
                      onUpdate={handleMembershipUpdate}
                      size="sm"
                      showLabel={false}
                    />
                    <button
                      onClick={() => deleteMembership(m._id)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Delete membership"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    End Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Renewal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {memberships.map(m => (
                  <tr key={m._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {m.userName}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{m.planName}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {m.startDate ? formatDate(m.startDate) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {m.endDate ? formatDate(m.endDate) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <MembershipRenewalToggle
                        membership={m}
                        onUpdate={handleMembershipUpdate}
                        size="sm"
                        showLabel={false}
                      />
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(m.status, m.active)}`}>
                        {getStatusIcon(m.status, m.active)}
                        {m.active ? m.status : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => edit(m)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit membership"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {m.active ? (
                          <button
                            onClick={() => deactivateMembership(m._id)}
                            disabled={isSubmitting}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                            title="Deactivate membership"
                          >
                            <PowerOff className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivateMembership(m._id)}
                            disabled={isSubmitting}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Reactivate membership"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMembership(m._id)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete membership"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {memberships.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No memberships found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first membership.</p>
                <button
                  onClick={() => { setFormData({ userID: '', planID: '', startDate: '', renewalOption: true }); setIsModalOpen(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Membership
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {formData._id ? 'Edit Membership' : 'Create New Membership'}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {formData._id ? 'Update membership details' : 'Assign a membership plan to a user'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)]">
                {localError && (
                  <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-md mb-6 flex items-center">
                    <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                    <span>{localError}</span>
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); createOrUpdate(); }} className="space-y-6">
                  {/* User Selection */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      User Selection
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select User *
                      </label>
                      <select
                        name="userID"
                        value={formData.userID}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Choose a user</option>
                        {users.map(user => (
                          <option key={user.value} value={user.value}>
                            {user.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Plan Selection */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      Plan Selection
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Membership Plan *
                      </label>
                      <select
                        name="planID"
                        value={formData.planID}
                        onChange={handleChange}
                        required
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Choose a plan</option>
                        {plans.map(plan => (
                          <option key={plan.value} value={plan.value}>
                            {plan.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Membership Settings */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      Membership Settings
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date *
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="renewalOption"
                          checked={formData.renewalOption}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label className="ml-3 text-sm font-medium text-gray-700">
                          Auto-Renew Membership
                        </label>
                      </div>
                      <p className="text-xs text-gray-500">
                        When enabled, the membership will automatically renew at the end of the current period.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                      {formData._id ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Update Membership
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Membership
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMemberships;