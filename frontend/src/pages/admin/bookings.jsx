import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { formatDate, formatTime } from '../../utils/helpers';
import { API_PATHS } from '../../utils/apiPaths';
import SkeletonLoader from '../../components/Loaders/SkeletonLoader';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';
import SelectInput from '../../components/Inputs/SelectInput';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAction, setIsAction] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get(API_PATHS.BOOKINGS.GET_ALL);
      setBookings(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    setIsAction(prev => ({ ...prev, [id]: 'update' }));
    try {
      await api.put(API_PATHS.BOOKINGS.UPDATE_STATUS(id), { bookingStatus: status });
      fetchBookings();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  const deleteBooking = async (id) => {
    setIsAction(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await api.delete(API_PATHS.BOOKINGS.DELETE(id));
      fetchBookings();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete booking');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Bookings</h1>
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <table className="table w-full">
        <thead><tr><th>User</th><th>Type</th><th>Class/Trainer</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b._id}>
              <td>{b.userID.name}</td>
              <td>{b.bookingType}</td>
              <td>{b.bookingType === 'class' ? b.classID.className : b.trainerID.trainerName}</td>
              <td>{formatDate(b.date)}</td>
              <td>{formatTime(b.startTime)} - {formatTime(b.endTime)}</td>
              <td>
                <SelectInput
                  label="Status"
                  name="bookingStatus"
                  options={[{ value: 'Pending', label: 'Pending' }, { value: 'Confirmed', label: 'Confirmed' }, { value: 'Cancelled', label: 'Cancelled' }]}
                  value={b.bookingStatus}
                  onChange={e => updateStatus(b._id, e.target.value)}
                />
              </td>
              <td>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => deleteBooking(b._id)}
                  disabled={isAction[b._id] === 'delete'}
                >
                  {isAction[b._id] === 'delete' ? <SpinnerLoader /> : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AdminLayout>
  );
};

export default AdminBookings;