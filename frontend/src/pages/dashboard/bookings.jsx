import { useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import api from '../../utils/axiosInstance';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { formatDate, formatTime, getISODate } from '../../utils/helpers';
import { API_PATHS } from '../../utils/apiPaths';
import BlackSkeletonLoader from '../../components/Loaders/BlackSkeletonLoader';
import Modal from '../../components/Modal';
import TextInput from '../../components/Inputs/TextInput';
import SelectInput from '../../components/Inputs/SelectInput';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';
import { useRouter } from 'next/router';
import { 
  Calendar, 
  Clock, 
  User, 
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Edit,
  Filter,
  Search
} from 'lucide-react';

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
      const res = await api.get(API_PATHS.CLASSES.GET_ALL_WITH_AVAILABILITY, { params: { date: getISODate(new Date()) } });
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

  if (loading || isLoading) return <BlackSkeletonLoader lines={10} />;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-white/70">Manage your fitness class and trainer bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            {localError}
          </div>
        )}

        {/* Header with Create Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 mr-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Bookings Overview</h2>
                <p className="text-gray-600">Total bookings: {bookings.length}</p>
              </div>
            </div>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Booking
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Bookings</h3>
          </div>
          
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-4">Start by booking a class or personal training session.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Booking
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class/Trainer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map(b => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {b.bookingType === 'class' ? (
                            <Users className="w-4 h-4 mr-2 text-blue-500" />
                          ) : (
                            <User className="w-4 h-4 mr-2 text-green-500" />
                          )}
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {b.bookingType}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {b.bookingType === 'class' ? b.classID?.className || 'N/A' : b.trainerID?.trainerName || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(b.date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatTime(b.startTime)} - {formatTime(b.endTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          b.bookingStatus === 'Confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : b.bookingStatus === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : b.bookingStatus === 'Completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {b.bookingStatus === 'Confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {b.bookingStatus === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                          {b.bookingStatus === 'Completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {b.bookingStatus === 'Cancelled' && <XCircle className="w-3 h-3 mr-1" />}
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {b.bookingStatus !== 'Cancelled' && b.bookingStatus !== 'Completed' && (
                          <button
                            className="text-red-600 hover:text-red-900 flex items-center"
                            onClick={() => cancelBooking(b._id)}
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <SpinnerLoader />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 mr-1" />
                                Cancel
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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