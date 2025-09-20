import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../utils/axiosInstance';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { formatDate, formatTime } from '../../utils/helpers';
import { API_PATHS } from '../../utils/apiPaths';
import SkeletonLoader from '../../components/Loaders/SkeletonLoader';
import Modal from '../../components/Modal';
import TextInput from '../../components/Inputs/TextInput';
import SelectInput from '../../components/Inputs/SelectInput';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';
import { useRouter } from 'next/router';

const Bookings = () => {
  const { user, loading, error } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bookingType: 'class',
    classID: '',
    trainerID: '',
    date: '',
    startTime: '',
    endTime: '',
    goal: ''
  });
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login');
    else if (user) {
      fetchBookings();
      fetchTrainers();
      fetchClasses();
    }
  }, [user, loading]);

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

  const fetchTrainers = async () => {
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data.map(t => ({ value: t._id, label: t.trainerName })));
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get(API_PATHS.CLASSES.GET_ALL_WITH_AVAILABILITY, { params: { date: formatDate(new Date()) } });
      setClasses(res.data.map(c => ({ value: c._id, label: c.className })));
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch classes');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createBooking = async () => {
    setIsSubmitting(true);
    try {
      const data = { bookingType: formData.bookingType };
      if (formData.bookingType === 'class') {
        data.classID = formData.classID;
        data.date = formData.date;
      } else {
        data.trainerID = formData.trainerID;
        data.date = formData.date;
        data.startTime = formData.startTime;
        data.endTime = formData.endTime;
        data.goal = formData.goal;
      }
      await api.post(API_PATHS.BOOKINGS.CREATE, data);
      setIsModalOpen(false);
      setFormData({ bookingType: 'class', classID: '', trainerID: '', date: '', startTime: '', endTime: '', goal: '' });
      fetchBookings();
      setLocalError(null);
      alert('Booking created successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelBooking = async (id) => {
    setIsSubmitting(true);
    try {
      await api.put(API_PATHS.BOOKINGS.CANCEL(id));
      fetchBookings();
      setLocalError(null);
      alert('Booking cancelled successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoading) return <SkeletonLoader />;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">My Bookings</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      <button className="btn btn-primary mb-4" onClick={() => setIsModalOpen(true)}>Create Booking</button>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Type</th>
              <th>Class/Trainer</th>
              <th>Date</th>
              <th>Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b._id}>
                <td>{b.bookingType}</td>
                <td>{b.bookingType === 'class' ? b.classID?.className : b.trainerID?.trainerName}</td>
                <td>{formatDate(b.date)}</td>
                <td>{formatTime(b.startTime)} - {formatTime(b.endTime)}</td>
                <td>{b.bookingStatus}</td>
                <td>
                  {b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Completed' && (
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => cancelBooking(b._id)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <SpinnerLoader /> : 'Cancel'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SelectInput
          label="Booking Type"
          name="bookingType"
          options={[{ value: 'class', label: 'Class' }, { value: 'personal', label: 'Personal' }]}
          value={formData.bookingType}
          onChange={handleChange}
        />
        {formData.bookingType === 'class' ? (
          <>
            <SelectInput
              label="Class"
              name="classID"
              options={classes}
              value={formData.classID}
              onChange={handleChange}
            />
            <TextInput
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <SelectInput
              label="Trainer"
              name="trainerID"
              options={trainers}
              value={formData.trainerID}
              onChange={handleChange}
            />
            <TextInput
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
            <TextInput
              label="Start Time"
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
            />
            <TextInput
              label="End Time"
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
            />
            <TextInput
              label="Goal"
              name="goal"
              value={formData.goal}
              onChange={handleChange}
            />
          </>
        )}
        <button
          className="btn btn-primary mt-4"
          onClick={createBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? <SpinnerLoader /> : 'Create'}
        </button>
      </Modal>
    </DashboardLayout>
  );
};

export default Bookings;