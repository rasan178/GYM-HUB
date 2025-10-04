import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { api } from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar, 
  CheckCircle,
  X,
  Info
} from 'lucide-react';

const AdminPlans = () => {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [hoveredBenefit, setHoveredBenefit] = useState(null);
  const [hoveredDescription, setHoveredDescription] = useState(null);
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    benifits: '',
    price: '',
    durationMonths: ''
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get(API_PATHS.PLANS.GET_ALL);
      setPlans(res.data);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    try {
      if (formData._id) {
        await api.put(API_PATHS.ADMIN.PLANS.UPDATE(formData._id), formData);
      } else {
        await api.post(API_PATHS.ADMIN.PLANS.CREATE, formData);
      }
      
      setIsModalOpen(false);
      setFormData({
        planName: '',
        description: '',
        benifits: '',
        price: '',
        durationMonths: ''
      });
      fetchPlans();
      alert('Plan saved successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = plan => {
    setFormData({
      _id: plan._id,
      planName: plan.planName,
      description: plan.description || '',
      benifits: plan.benifits || '',
      price: plan.price,
      durationMonths: plan.durationMonths
    });
    setIsModalOpen(true);
  };

  const handleDelete = async id => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    setIsSubmitting(true);
    try {
      await api.delete(API_PATHS.ADMIN.PLANS.DELETE(id));
      fetchPlans();
      alert('Plan deleted successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setFormData({
      planName: '',
      description: '',
      benifits: '',
      price: '',
      durationMonths: ''
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center min-h-screen">
          <SpinnerLoader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Plan
          </button>
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {localError}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {plans.map(plan => (
              <div key={plan._id} className="border-b border-gray-200 p-4 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.planName}</h3>
                    <p className="text-xs text-gray-500">ID: {plan.planID}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                      disabled={isSubmitting}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">${plan.price}</span>
                    <span className="text-gray-500 ml-1">total</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{plan.durationMonths}</span>
                    <span className="text-gray-500 ml-1">month{plan.durationMonths > 1 ? 's' : ''}</span>
                  </div>
                  
                  {plan.description && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Description: </span>
                      <span className={`${plan.description.length > 80 ? 'line-clamp-2' : ''}`}>
                        {plan.description}
                      </span>
                      {plan.description.length > 80 && (
                        <div className="text-xs text-blue-600 mt-1">
                          +{plan.description.length - 80} more characters
                        </div>
                      )}
                    </div>
                  )}
                  
                  {plan.benifits && (
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">Benefits:</span>
                      <div className="mt-1 space-y-1">
                        {plan.benifits.split(',').slice(0, 3).map((benefit, index) => (
                          <div key={index} className="flex items-start">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-xs">{benefit.trim()}</span>
                          </div>
                        ))}
                        {plan.benifits.split(',').length > 3 && (
                          <div className="text-xs text-blue-600">
                            +{plan.benifits.split(',').length - 3} more benefits
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
                    Plan Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                    Benefits
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map(plan => (
                  <tr key={plan._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{plan.planName}</div>
                      <div className="text-xs text-gray-500">ID: {plan.planID}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 relative">
                        {plan.description ? (
                          <div className="max-w-xs">
                            {plan.description.length > 100 ? (
                              <div className="relative">
                                <p className="line-clamp-3 cursor-pointer" 
                                   onMouseEnter={() => setHoveredDescription(plan._id)}
                                   onMouseLeave={() => setHoveredDescription(null)}>
                                  {plan.description}
                                </p>
                                
                                {/* Description Tooltip */}
                                {hoveredDescription === plan._id && (
                                  <div className="absolute z-10 bottom-full left-0 mb-2 w-80 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3">
                                    <div className="font-semibold text-white mb-2">Full Description:</div>
                                    <p className="leading-relaxed">{plan.description}</p>
                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                                  </div>
                                )}
                                
                                <div className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                  <Info className="w-3 h-3" />
                                  +{plan.description.length - 100} more characters
                                </div>
                              </div>
                            ) : (
                              <p className="line-clamp-3">{plan.description}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">No description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="font-medium">${plan.price}</span>
                        <span className="text-gray-500 ml-1">total</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="font-medium">{plan.durationMonths}</span>
                        <span className="text-gray-500 ml-1">month{plan.durationMonths > 1 ? 's' : ''}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 relative">
                        {plan.benifits ? (
                          <div className="space-y-1 max-w-sm">
                            {plan.benifits.split(',').slice(0, 4).map((benefit, index) => (
                              <div key={index} className="flex items-start">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                <span className="text-xs leading-relaxed">{benefit.trim()}</span>
                              </div>
                            ))}
                            {plan.benifits.split(',').length > 4 && (
                              <div className="relative">
                                <button
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-1"
                                  onMouseEnter={() => setHoveredBenefit(plan._id)}
                                  onMouseLeave={() => setHoveredBenefit(null)}
                                >
                                  <Info className="w-3 h-3" />
                                  +{plan.benifits.split(',').length - 4} more benefits
                                </button>
                                
                                {/* Tooltip */}
                                {hoveredBenefit === plan._id && (
                                  <div className="absolute z-10 bottom-full left-0 mb-2 w-80 bg-gray-900 text-white text-xs rounded-lg shadow-lg p-3">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-white mb-2">All Benefits:</div>
                                      {plan.benifits.split(',').map((benefit, index) => (
                                        <div key={index} className="flex items-start">
                                          <CheckCircle className="w-3 h-3 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                                          <span className="leading-relaxed">{benefit.trim()}</span>
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
                          <span className="text-gray-500 italic text-xs">No benefits listed</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleEdit(plan)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          disabled={isSubmitting}
                          title="Edit plan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          disabled={isSubmitting}
                          title="Delete plan"
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
          
          {plans.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No plans found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first membership plan.</p>
                <button
                  onClick={openCreateModal}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Plan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {formData._id ? 'Edit Membership Plan' : 'Create New Plan'}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {formData._id ? 'Update plan details and pricing' : 'Set up a new membership plan for your gym'}
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

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Plan Basic Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      Basic Information
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Plan Name *
                        </label>
                        <input
                          type="text"
                          name="planName"
                          value={formData.planName}
                          onChange={handleChange}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          placeholder="e.g., Premium Membership"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="Brief description of the plan features and target audience..."
                        />
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <Info className="w-3 h-3 mr-1" />
                          Optional: Provide a short description of what this plan offers
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Benefits Section */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      Plan Benefits
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Benefits *
                      </label>
                      <textarea
                        name="benifits"
                        value={formData.benifits}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Gym equipment access, Locker & showers, Swimming pool access, Personal training sessions, Group classes, Nutrition consultation..."
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center">
                        <Info className="w-3 h-3 mr-1" />
                        Separate each benefit with a comma. Be specific and clear about what members get.
                      </p>
                    </div>
                  </div>

                  {/* Pricing & Duration */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      Pricing & Duration
                    </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Total Price (for entire duration) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-gray-500 text-lg">$</span>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                            placeholder="599.99"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Total amount for the entire membership duration
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (months) *
                        </label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-3 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            name="durationMonths"
                            value={formData.durationMonths}
                            onChange={handleChange}
                            required
                            min="1"
                            max="24"
                            className="w-full border-2 border-gray-200 rounded-lg pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                            placeholder="12"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Membership duration in months (1-24)
                        </p>
                      </div>
                    </div>

                    {/* Price Summary */}
                    {formData.price && formData.durationMonths && (
                      <div className="mt-6 p-4 bg-white rounded-lg border-2 border-gray-100">
                        <h4 className="font-semibold text-gray-900 mb-2">Price Summary</h4>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Total Price:</span>
                          <span className="font-bold text-lg text-green-600">${formData.price}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">Duration:</span>
                          <span className="font-medium">{formData.durationMonths} month{formData.durationMonths > 1 ? 's' : ''}</span>
                        </div>
                        <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between items-center text-sm">
                          <span className="text-gray-600">Average per month:</span>
                          <span className="font-medium text-blue-600">${(formData.price / formData.durationMonths).toFixed(2)}</span>
                        </div>
                      </div>
                    )}
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
                      {isSubmitting ? (
                        <>
                          <SpinnerLoader />
                          {formData._id ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {formData._id ? (
                            <>
                              <Edit className="w-4 h-4" />
                              Update Plan
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4" />
                              Create Plan
                            </>
                          )}
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

export default AdminPlans;
