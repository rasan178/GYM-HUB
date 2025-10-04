import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    trainers: { total: 0, active: 0, deactivated: 0 },
    bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0 },
    testimonials: { total: 0, approved: 0, pending: 0, rejected: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [userStats, trainerStats, bookings, testimonials] = await Promise.all([
        api.get(API_PATHS.ADMIN.USERS.GET_STATS),
        api.get(API_PATHS.ADMIN.TRAINERS.GET_STATS),
        api.get(API_PATHS.BOOKINGS.GET_ALL),
        api.get(API_PATHS.ADMIN.TESTIMONIALS.GET_ALL)
      ]);

      // Calculate booking stats
      const bookingStats = {
        total: bookings.data.length,
        confirmed: bookings.data.filter(b => b.bookingStatus === 'Confirmed').length,
        pending: bookings.data.filter(b => b.bookingStatus === 'Pending').length,
        cancelled: bookings.data.filter(b => b.bookingStatus === 'Cancelled').length
      };

      // Calculate testimonial stats
      const testimonialStats = {
        total: testimonials.data.length,
        approved: testimonials.data.filter(t => t.status === 'Approved').length,
        pending: testimonials.data.filter(t => t.status === 'Pending').length,
        rejected: testimonials.data.filter(t => t.status === 'Rejected').length
      };

      setStats({
        users: userStats.data,
        trainers: trainerStats.data,
        bookings: bookingStats,
        testimonials: testimonialStats
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your gym management system</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* User Statistics */}
          <StatCard
            title="Total Users"
            value={stats.users.total}
            icon={Users}
            color="bg-blue-500"
            subtitle={`${stats.users.active} active, ${stats.users.inactive} inactive`}
          />
          <StatCard
            title="Active Users"
            value={stats.users.active}
            icon={UserCheck}
            color="bg-green-500"
            subtitle="Currently active members"
          />
          <StatCard
            title="Inactive Users"
            value={stats.users.inactive}
            icon={UserX}
            color="bg-gray-500"
            subtitle="Suspended or inactive"
          />

          {/* Trainer Statistics */}
          <StatCard
            title="Total Trainers"
            value={stats.trainers.total}
            icon={Users}
            color="bg-purple-500"
            subtitle={`${stats.trainers.active} active, ${stats.trainers.deactivated} deactivated`}
          />
          <StatCard
            title="Active Trainers"
            value={stats.trainers.active}
            icon={UserCheck}
            color="bg-green-500"
            subtitle="Available for bookings"
          />
          <StatCard
            title="Deactivated Trainers"
            value={stats.trainers.deactivated}
            icon={UserX}
            color="bg-red-500"
            subtitle="Temporarily unavailable"
          />

          {/* Booking Statistics */}
          <StatCard
            title="Total Bookings"
            value={stats.bookings.total}
            icon={Calendar}
            color="bg-indigo-500"
            subtitle="All time bookings"
          />
          <StatCard
            title="Confirmed Bookings"
            value={stats.bookings.confirmed}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Active appointments"
          />
          <StatCard
            title="Pending Bookings"
            value={stats.bookings.pending}
            icon={AlertCircle}
            color="bg-yellow-500"
            subtitle="Awaiting confirmation"
          />
          <StatCard
            title="Cancelled Bookings"
            value={stats.bookings.cancelled}
            icon={XCircle}
            color="bg-red-500"
            subtitle="Cancelled appointments"
          />

          {/* Testimonial Statistics */}
          <StatCard
            title="Total Testimonials"
            value={stats.testimonials.total}
            icon={Activity}
            color="bg-pink-500"
            subtitle="All customer reviews"
          />
          <StatCard
            title="Approved Testimonials"
            value={stats.testimonials.approved}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Published reviews"
          />
          <StatCard
            title="Pending Testimonials"
            value={stats.testimonials.pending}
            icon={AlertCircle}
            color="bg-yellow-500"
            subtitle="Awaiting review"
          />
          <StatCard
            title="Rejected Testimonials"
            value={stats.testimonials.rejected}
            icon={XCircle}
            color="bg-red-500"
            subtitle="Not approved"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">View and manage user accounts</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Trainers</p>
                  <p className="text-sm text-gray-500">Trainer management and scheduling</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-indigo-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">View Bookings</p>
                  <p className="text-sm text-gray-500">Monitor all appointments</p>
                </div>
              </div>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-pink-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Review Testimonials</p>
                  <p className="text-sm text-gray-500">Approve customer reviews</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;