import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  MessageSquare,
  AlertCircle,
  Users,
  Info
} from 'lucide-react';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isAction, setIsAction] = useState({});

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get(API_PATHS.ADMIN.TESTIMONIALS.GET_ALL);
      setTestimonials(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch testimonials');
    }
  };

  const approve = async (id) => {
    setIsAction(prev => ({ ...prev, [id]: 'approve' }));
    try {
      await api.put(API_PATHS.ADMIN.TESTIMONIALS.APPROVE(id));
      fetchTestimonials();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to approve testimonial');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  const reject = async (id) => {
    setIsAction(prev => ({ ...prev, [id]: 'reject' }));
    try {
      await api.put(API_PATHS.ADMIN.TESTIMONIALS.REJECT(id));
      fetchTestimonials();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to reject testimonial');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  const deleteTestimonial = async (id) => {
    setIsAction(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await api.delete(API_PATHS.ADMIN.TESTIMONIALS.DELETE(id));
      fetchTestimonials();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete testimonial');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <AlertCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };


  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Testimonial Management</h1>
            <p className="text-gray-600 mt-1">Review and manage customer testimonials</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{testimonials.length} total testimonials</span>
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
            {testimonials.map(t => (
              <div key={t._id} className="border-b border-gray-200 p-4 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {t.userName}
                    </h3>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(t.status)}`}>
                    {getStatusIcon(t.status)}
                    {t.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-start text-sm">
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{t.message}</p>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  {t.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approve(t._id)}
                        disabled={isAction[t._id] === 'approve'}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => reject(t._id)}
                        disabled={isAction[t._id] === 'reject'}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => deleteTestimonial(t._id)}
                    disabled={isAction[t._id] === 'delete'}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-96">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testimonials.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {t.userName}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        <p className="line-clamp-3">{t.message}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(t.status)}`}>
                        {getStatusIcon(t.status)}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {t.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => approve(t._id)}
                              disabled={isAction[t._id] === 'approve'}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => reject(t._id)}
                              disabled={isAction[t._id] === 'reject'}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteTestimonial(t._id)}
                          disabled={isAction[t._id] === 'delete'}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete testimonial"
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
          
          {testimonials.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
                <p className="text-gray-500">No testimonials have been submitted yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;