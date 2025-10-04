import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { formatDate, formatTime } from '../../utils/helpers';
import { API_PATHS } from '../../utils/apiPaths';
import BlackSkeletonLoader from '../../components/Loaders/BlackSkeletonLoader';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';
import { 
  Calendar, 
  Clock, 
  User, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Users,
  Activity
} from 'lucide-react';

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
      await api.put(API_PATHS.ADMIN.BOOKINGS.UPDATE_STATUS(id), { bookingStatus: status });
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
      await api.delete(API_PATHS.ADMIN.BOOKINGS.DELETE(id));
      fetchBookings();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete booking');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <AlertCircle className="w-4 h-4" />;
      case 'Cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) return <BlackSkeletonLoader lines={12} />;

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600 mt-1">Manage all gym bookings and appointments</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{bookings.length} total bookings</span>
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
            {bookings.map(booking => (
              <div key={booking._id} className="border-b border-gray-200 p-4 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {booking.userID?.name || 'N/A'}
                    </h3>
                    <p className="text-xs text-gray-500">{booking.bookingType}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(booking.bookingStatus)}`}>
                      {getStatusIcon(booking.bookingStatus)}
                      {booking.bookingStatus}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Activity className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">
                      {booking.bookingType === 'class' 
                        ? (booking.classID?.className || booking.classID?.name || 'N/A') 
                        : (booking.trainerID?.trainerName || booking.trainerID?.name || 'N/A')}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{booking.date ? formatDate(booking.date) : 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>
                      {[booking.startTime, booking.endTime].some(Boolean) 
                        ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}` 
                        : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <select
                    value={booking.bookingStatus}
                    onChange={e => updateStatus(booking._id, e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  
                  <button
                    onClick={() => deleteBooking(booking._id)}
                    disabled={isAction[booking._id] === 'delete'}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    {isAction[booking._id] === 'delete' ? <SpinnerLoader /> : <Trash2 className="w-4 h-4" />}
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Class/Trainer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map(booking => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {booking.userID?.name || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {booking.bookingType}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.bookingType === 'class' 
                          ? (booking.classID?.className || booking.classID?.name || 'N/A') 
                          : (booking.trainerID?.trainerName || booking.trainerID?.name || 'N/A')}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {booking.date ? formatDate(booking.date) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {[booking.startTime, booking.endTime].some(Boolean) 
                          ? `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}` 
                          : 'N/A'}
                      </div>
              </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={booking.bookingStatus}
                        onChange={e => updateStatus(booking._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(booking.bookingStatus)}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
              </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                <button
                        onClick={() => deleteBooking(booking._id)}
                        disabled={isAction[booking._id] === 'delete'}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete booking"
                      >
                        {isAction[booking._id] === 'delete' ? <SpinnerLoader /> : <Trash2 className="w-4 h-4" />}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
          </div>
          
          {bookings.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-500">No bookings have been made yet.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookings;