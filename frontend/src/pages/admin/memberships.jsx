import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import Modal from '../../components/Modal';
import TextInput from '../../components/Inputs/TextInput';
import SelectInput from '../../components/Inputs/SelectInput';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import { formatDate } from '../../utils/helpers';
import { API_PATHS } from '../../utils/apiPaths';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';
import BlackSkeletonLoader from '../../components/Loaders/BlackSkeletonLoader';

const AdminMemberships = () => {
  const { error } = useContext(AuthContext);
  const [memberships, setMemberships] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ userID: '', planID: '', startDate: '', renewalOption: true });
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMemberships();
    fetchUsers();
    fetchPlans();
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
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete membership');
    } finally {
      setIsSubmitting(false);
    }
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

  if (isLoading) return <BlackSkeletonLoader lines={10} />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Memberships</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <button
        className="btn btn-primary mb-4"
        onClick={() => { setFormData({ userID: '', planID: '', startDate: '', renewalOption: true }); setIsModalOpen(true); }}
      >
        Create Membership
      </button>
      <table className="table w-full">
        <thead><tr><th>User</th><th>Plan</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {memberships.map(m => (
            <tr key={m._id}>
              <td>{m.userName}</td>
              <td>{m.planName}</td>
              <td>{m.status}</td>
              <td>
                <button className="btn btn-sm btn-primary mr-2" onClick={() => edit(m)}>Edit</button>
                {m.active ? (
                  <button className="btn btn-sm btn-warning mr-2" onClick={() => deactivateMembership(m._id)}>Deactivate</button>
                ) : (
                  <button className="btn btn-sm btn-success mr-2" onClick={() => reactivateMembership(m._id)}>Reactivate</button>
                )}
                <button className="btn btn-sm btn-error" onClick={() => deleteMembership(m._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SelectInput label="User" name="userID" options={users} value={formData.userID} onChange={handleChange} required />
        <SelectInput label="Plan" name="planID" options={plans} value={formData.planID} onChange={handleChange} required />
        <TextInput label="Start Date" type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text">Auto-Renew</span>
          </label>
          <input
            type="checkbox"
            name="renewalOption"
            checked={formData.renewalOption}
            onChange={handleChange}
            className="checkbox"
          />
        </div>
        <button
          className="btn btn-primary mt-4"
          onClick={createOrUpdate}
          disabled={isSubmitting}
        >
          {isSubmitting ? <SpinnerLoader /> : 'Save'}
        </button>
      </Modal>
    </AdminLayout>
  );
};

export default AdminMemberships;