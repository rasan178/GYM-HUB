import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { API_PATHS } from '../../utils/apiPaths';
import BlackSkeletonLoader from '../../components/Loaders/BlackSkeletonLoader';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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
    } finally {
      setIsLoading(false);
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

  if (isLoading) return <BlackSkeletonLoader lines={10} />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Testimonials</h1>
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <table className="table w-full">
        <thead><tr><th>User</th><th>Message</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {testimonials.map(t => (
            <tr key={t._id}>
              <td>{t.userName}</td>
              <td>{t.message}</td>
              <td>{t.status}</td>
              <td>
                {t.status === 'Pending' && (
                  <>
                    <button
                      className="btn btn-sm btn-success mr-2"
                      onClick={() => approve(t._id)}
                      disabled={isAction[t._id] === 'approve'}
                    >
                      {isAction[t._id] === 'approve' ? <SpinnerLoader /> : 'Approve'}
                    </button>
                    <button
                      className="btn btn-sm btn-warning mr-2"
                      onClick={() => reject(t._id)}
                      disabled={isAction[t._id] === 'reject'}
                    >
                      {isAction[t._id] === 'reject' ? <SpinnerLoader /> : 'Reject'}
                    </button>
                  </>
                )}
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => deleteTestimonial(t._id)}
                  disabled={isAction[t._id] === 'delete'}
                >
                  {isAction[t._id] === 'delete' ? <SpinnerLoader /> : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default AdminTestimonials;