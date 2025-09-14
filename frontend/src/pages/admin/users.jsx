import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { API_PATHS } from '../../utils/apiPaths';
import SkeletonLoader from '../../components/Loaders/SkeletonLoader';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get(API_PATHS.USERS.GET_ALL);
      setUsers(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    try {
      await api.delete(API_PATHS.USERS.DELETE(id));
      fetchUsers();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(prev => ({ ...prev, [id]: false }));
    }
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Users</h1>
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <table className="table w-full">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.status}</td>
              <td>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => deleteUser(u._id)}
                  disabled={isDeleting[u._id]}
                >
                  {isDeleting[u._id] ? <SpinnerLoader /> : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default AdminUsers;