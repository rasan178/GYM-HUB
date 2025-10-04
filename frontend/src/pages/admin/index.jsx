import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
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
  BarChart3,
  CreditCard,
  Clock,
  MessageSquare,
  Star,
  BookOpen,
  Target,
  AlertTriangle,
  Power,
  PowerOff
} from 'lucide-react';

const AdminDashboard = () => {
  const router = useRouter();
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    trainers: { total: 0, active: 0, deactivated: 0 },
    bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0, classBookings: 0, personalBookings: 0 },
    testimonials: { total: 0, approved: 0, pending: 0, rejected: 0, averageRating: 0, ratedTestimonials: 0 },
    classes: { total: 0, active: 0, inactive: 0, adminDeactivated: 0 },
    membershipRequests: { total: 0, pending: 0, approved: 0, rejected: 0 },
    memberships: { total: 0, active: 0, inactive: 0, expired: 0 },
    plans: { total: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [
        userStats, 
        trainerStats, 
        bookingStats, 
        testimonialStats,
        classStats,
        membershipRequestStats,
        membershipStats,
        plans
      ] = await Promise.all([
        api.get(API_PATHS.ADMIN.USERS.GET_STATS).catch(() => ({ data: { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 } })),
        api.get(API_PATHS.TRAINERS.GET_STATS).catch(() => ({ data: { totalTrainers: 0, activeTrainers: 0, inactiveTrainers: 0, adminDeactivatedTrainers: 0 } })),
        api.get(API_PATHS.BOOKINGS.GET_STATS).catch(() => ({ data: { totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, cancelledBookings: 0, completedBookings: 0, classBookings: 0, personalBookings: 0 } })),
        api.get(API_PATHS.TESTIMONIALS.GET_STATS).catch(() => ({ data: { totalTestimonials: 0, pendingTestimonials: 0, approvedTestimonials: 0, rejectedTestimonials: 0, averageRating: 0, ratedTestimonials: 0 } })),
        api.get(API_PATHS.CLASSES.GET_STATS).catch(() => ({ data: { totalClasses: 0, activeClasses: 0, inactiveClasses: 0, adminDeactivatedClasses: 0 } })),
        api.get(API_PATHS.MEMBERSHIP_REQUESTS.ADMIN.GET_ALL).catch(() => ({ data: { requests: [] } })),
        api.get(API_PATHS.MEMBERSHIPS.GET_STATS).catch(() => ({ data: { totalMemberships: 0, activeMemberships: 0, inactiveMemberships: 0, expiredMemberships: 0 } })),
        api.get(API_PATHS.PLANS.GET_ALL).catch(() => ({ data: [] }))
      ]);

      // Calculate membership request stats
      const membershipRequestData = membershipRequestStats.data.requests || membershipRequestStats.data || [];
      const membershipRequestStatsCalculated = {
        total: membershipRequestData.length,
        pending: membershipRequestData.filter(r => r.status === 'Pending').length,
        approved: membershipRequestData.filter(r => r.status === 'Approved').length,
        rejected: membershipRequestData.filter(r => r.status === 'Rejected').length
      };

      // Calculate plans stats
      const plansStats = {
        total: plans.data.length
      };

      setStats({
        users: {
          total: userStats.data.totalUsers,
          active: userStats.data.activeUsers,
          inactive: userStats.data.inactiveUsers
        },
        trainers: {
          total: trainerStats.data.totalTrainers,
          active: trainerStats.data.activeTrainers,
          deactivated: trainerStats.data.adminDeactivatedTrainers
        },
        bookings: {
          total: bookingStats.data.totalBookings,
          confirmed: bookingStats.data.confirmedBookings,
          pending: bookingStats.data.pendingBookings,
          cancelled: bookingStats.data.cancelledBookings,
          completed: bookingStats.data.completedBookings,
          classBookings: bookingStats.data.classBookings,
          personalBookings: bookingStats.data.personalBookings
        },
        testimonials: {
          total: testimonialStats.data.totalTestimonials,
          approved: testimonialStats.data.approvedTestimonials,
          pending: testimonialStats.data.pendingTestimonials,
          rejected: testimonialStats.data.rejectedTestimonials,
          averageRating: testimonialStats.data.averageRating,
          ratedTestimonials: testimonialStats.data.ratedTestimonials
        },
        classes: {
          total: classStats.data.totalClasses,
          active: classStats.data.activeClasses,
          inactive: classStats.data.inactiveClasses,
          adminDeactivated: classStats.data.adminDeactivatedClasses
        },
        membershipRequests: membershipRequestStatsCalculated,
        memberships: {
          total: membershipStats.data.totalMemberships,
          active: membershipStats.data.activeMemberships,
          inactive: membershipStats.data.inactiveMemberships,
          expired: membershipStats.data.expiredMemberships
        },
        plans: plansStats
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

  // Navigation functions for Quick Actions
  const navigateToUsers = () => router.push('/admin/users');
  const navigateToTrainers = () => router.push('/admin/trainers');
  const navigateToBookings = () => router.push('/admin/bookings');
  const navigateToTestimonials = () => router.push('/admin/testimonials');
  const navigateToClasses = () => router.push('/admin/classes');
  const navigateToMemberships = () => router.push('/admin/memberships');
  const navigateToMembershipRequests = () => router.push('/admin/membership-requests');
  const navigateToPlans = () => router.push('/admin/plans');

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(25)].map((_, i) => (
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
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-white mt-1">Overview of your gym management system</p>
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
          <StatCard
            title="Completed Bookings"
            value={stats.bookings.completed}
            icon={TrendingUp}
            color="bg-purple-500"
            subtitle="Finished sessions"
          />
          <StatCard
            title="Class Bookings"
            value={stats.bookings.classBookings}
            icon={Users}
            color="bg-indigo-500"
            subtitle="Group class appointments"
          />
          <StatCard
            title="Personal Bookings"
            value={stats.bookings.personalBookings}
            icon={Target}
            color="bg-orange-500"
            subtitle="One-on-one sessions"
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
          <StatCard
            title="Average Rating"
            value={stats.testimonials.averageRating || 'N/A'}
            icon={Star}
            color="bg-purple-500"
            subtitle="Customer satisfaction"
          />
          <StatCard
            title="Rated Testimonials"
            value={stats.testimonials.ratedTestimonials}
            icon={TrendingUp}
            color="bg-indigo-500"
            subtitle="With star ratings"
          />

          {/* Class Statistics */}
          <StatCard
            title="Total Classes"
            value={stats.classes.total}
            icon={Calendar}
            color="bg-blue-500"
            subtitle="All gym classes"
          />
          <StatCard
            title="Active Classes"
            value={stats.classes.active}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Currently running"
          />
          <StatCard
            title="Inactive Classes"
            value={stats.classes.inactive}
            icon={XCircle}
            color="bg-gray-500"
            subtitle="Temporarily unavailable"
          />
          <StatCard
            title="Admin Deactivated"
            value={stats.classes.adminDeactivated}
            icon={AlertTriangle}
            color="bg-orange-500"
            subtitle="Manually disabled"
          />

          {/* Membership Request Statistics */}
          <StatCard
            title="Total Requests"
            value={stats.membershipRequests.total}
            icon={Users}
            color="bg-blue-500"
            subtitle="All membership requests"
          />
          <StatCard
            title="Pending Requests"
            value={stats.membershipRequests.pending}
            icon={Clock}
            color="bg-yellow-500"
            subtitle="Awaiting approval"
          />
          <StatCard
            title="Approved Requests"
            value={stats.membershipRequests.approved}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Successfully approved"
          />
          <StatCard
            title="Rejected Requests"
            value={stats.membershipRequests.rejected}
            icon={XCircle}
            color="bg-red-500"
            subtitle="Not approved"
          />

          {/* Membership Statistics */}
          <StatCard
            title="Total Memberships"
            value={stats.memberships.total}
            icon={CreditCard}
            color="bg-blue-500"
            subtitle="All active memberships"
          />
          <StatCard
            title="Active Memberships"
            value={stats.memberships.active}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Currently valid"
          />
          <StatCard
            title="Inactive Memberships"
            value={stats.memberships.inactive}
            icon={XCircle}
            color="bg-gray-500"
            subtitle="Suspended or paused"
          />
          <StatCard
            title="Expired Memberships"
            value={stats.memberships.expired}
            icon={Clock}
            color="bg-red-500"
            subtitle="Past expiration date"
          />

          {/* Plan Statistics */}
          <StatCard
            title="Total Plans"
            value={stats.plans.total}
            icon={BarChart3}
            color="bg-purple-500"
            subtitle="Available membership plans"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={navigateToUsers}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                  <p className="text-sm text-gray-500">View and manage user accounts</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToTrainers}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <UserCheck className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Trainers</p>
                  <p className="text-sm text-gray-500">Trainer management and scheduling</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToBookings}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-indigo-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">View Bookings</p>
                  <p className="text-sm text-gray-500">Monitor all appointments</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToTestimonials}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-pink-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-pink-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Review Testimonials</p>
                  <p className="text-sm text-gray-500">Approve customer reviews</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToClasses}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Classes</p>
                  <p className="text-sm text-gray-500">Create and schedule gym classes</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToMemberships}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Memberships</p>
                  <p className="text-sm text-gray-500">Handle member subscriptions</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToMembershipRequests}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-yellow-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Membership Requests</p>
                  <p className="text-sm text-gray-500">Review pending applications</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToPlans}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Plans</p>
                  <p className="text-sm text-gray-500">Create membership plans</p>
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