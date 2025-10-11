import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthContext from "../../context/AuthContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import BlackSkeletonLoader from "../../components/Loaders/BlackSkeletonLoader";
import api from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  CreditCard,
  Clock,
  Star,
  Target,
  Activity,
  TrendingUp,
  Users,
  BarChart3,
  Heart,
  Dumbbell,
  Timer,
  Award,
  User,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const [stats, setStats] = useState({
    bookings: { total: 0, confirmed: 0, pending: 0, cancelled: 0, completed: 0, classBookings: 0, personalBookings: 0 },
    memberships: { total: 0, active: 0, inactive: 0, expired: 0 },
    testimonials: { total: 0, approved: 0, pending: 0, rejected: 0 },
    sessions: { total: 0, completed: 0, pending: 0 },
    profile: { memberSince: null, totalWorkouts: 0, favoriteTrainer: null }
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [error, setError] = useState(null);

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const name = typeof window !== "undefined" ? localStorage.getItem("name") : null;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    } else if (user) {
      fetchUserStats();
    }
  }, [user, loading, router]);

  const fetchUserStats = async () => {
    try {
      setDashboardLoading(true);
      const [
        bookings,
        memberships,
        testimonials,
        sessions
      ] = await Promise.all([
        api.get(API_PATHS.BOOKINGS.GET_ALL).catch(() => ({ data: [] })),
        api.get(API_PATHS.MEMBERSHIPS.GET_ALL).catch(() => ({ data: { memberships: [] } })),
        api.get(API_PATHS.TESTIMONIALS.GET_MY).catch(() => ({ data: [] })),
        api.get(API_PATHS.SESSIONS.GET_MY).catch(() => ({ data: [] }))
      ]);

      // Process bookings data
      const bookingData = bookings.data || [];
      const bookingStats = {
        total: bookingData.length,
        confirmed: bookingData.filter(b => b.bookingStatus === 'Confirmed').length,
        pending: bookingData.filter(b => b.bookingStatus === 'Pending').length,
        cancelled: bookingData.filter(b => b.bookingStatus === 'Cancelled').length,
        completed: bookingData.filter(b => b.bookingStatus === 'Completed').length,
        classBookings: bookingData.filter(b => b.bookingType === 'class').length,
        personalBookings: bookingData.filter(b => b.bookingType === 'personal').length
      };

      // Process memberships data
      const membershipData = memberships.data.memberships || [];
      const membershipStats = {
        total: membershipData.length,
        active: membershipData.filter(m => m.status === 'Active').length,
        inactive: membershipData.filter(m => m.status === 'Inactive').length,
        expired: membershipData.filter(m => m.status === 'Expired').length
      };

      // Process testimonials data
      const testimonialData = testimonials.data || [];
      const testimonialStats = {
        total: testimonialData.length,
        approved: testimonialData.filter(t => t.status === 'Approved').length,
        pending: testimonialData.filter(t => t.status === 'Pending').length,
        rejected: testimonialData.filter(t => t.status === 'Rejected').length
      };

      // Process sessions data
      const sessionData = sessions.data || [];
      const sessionStats = {
        total: sessionData.length,
        completed: sessionData.filter(s => s.status === 'completed').length,
        pending: sessionData.filter(s => s.status === 'pending').length
      };

      // Calculate profile stats
      const profileStats = {
        memberSince: user?.createdDate ? new Date(user.createdDate).toLocaleDateString() : 'N/A',
        totalWorkouts: bookingStats.completed,
        favoriteTrainer: null // Could be enhanced with actual data
      };

      setStats({
        bookings: bookingStats,
        memberships: membershipStats,
        testimonials: testimonialStats,
        sessions: sessionStats,
        profile: profileStats
      });
      setError(null);
    } catch (err) {
      setError('Failed to fetch dashboard statistics');
      console.error('Dashboard stats error:', err);
    } finally {
      setDashboardLoading(false);
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
  const navigateToBookings = () => router.push('/dashboard/bookings');
  const navigateToMemberships = () => router.push('/dashboard/memberships');
  const navigateToTestimonials = () => router.push('/dashboard/testimonials');
  const navigateToProfile = () => router.push('/profile');
  const navigateToClasses = () => router.push('/classes');
  const navigateToTrainers = () => router.push('/trainers');
  const navigateToMembershipPlans = () => router.push('/memberships');
  const navigateToAIPlan = () => router.push('/ai-plan');

  if (loading || dashboardLoading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(16)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Your Dashboard</h1>
          <p className="text-white mt-1">Welcome back, {user?.name || name || "Guest"}! Here's your fitness overview.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Booking Statistics */}
          <StatCard
            title="Total Bookings"
            value={stats.bookings.total}
            icon={Calendar}
            color="bg-blue-500"
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
            title="Completed Workouts"
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
            subtitle="Group class sessions"
          />
          <StatCard
            title="Personal Trainings"
            value={stats.bookings.personalBookings}
            icon={Target}
            color="bg-orange-500"
            subtitle="One-on-one sessions"
          />

          {/* Membership Statistics */}
          <StatCard
            title="Total Memberships"
            value={stats.memberships.total}
            icon={CreditCard}
            color="bg-blue-500"
            subtitle="All memberships"
          />
          <StatCard
            title="Active Membership"
            value={stats.memberships.active}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Currently valid"
          />
          <StatCard
            title="Expired Memberships"
            value={stats.memberships.expired}
            icon={Clock}
            color="bg-red-500"
            subtitle="Past expiration date"
          />

          {/* Testimonial Statistics */}
          <StatCard
            title="My Reviews"
            value={stats.testimonials.total}
            icon={Star}
            color="bg-pink-500"
            subtitle="Reviews submitted"
          />
          <StatCard
            title="Approved Reviews"
            value={stats.testimonials.approved}
            icon={CheckCircle}
            color="bg-green-500"
            subtitle="Published reviews"
          />
          <StatCard
            title="Pending Reviews"
            value={stats.testimonials.pending}
            icon={AlertCircle}
            color="bg-yellow-500"
            subtitle="Awaiting approval"
          />

          {/* Profile Statistics */}
          <StatCard
            title="Member Since"
            value={stats.profile.memberSince}
            icon={User}
            color="bg-purple-500"
            subtitle="Your journey started"
          />
          <StatCard
            title="Total Workouts"
            value={stats.profile.totalWorkouts}
            icon={Dumbbell}
            color="bg-orange-500"
            subtitle="Completed sessions"
          />
          <StatCard
            title="Sessions Created"
            value={stats.sessions.total}
            icon={Timer}
            color="bg-indigo-500"
            subtitle="Workout sessions"
          />
          <StatCard
            title="Achievements"
            value="5"
            icon={Award}
            color="bg-yellow-500"
            subtitle="Fitness milestones"
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
              onClick={navigateToBookings}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">My Bookings</p>
                  <p className="text-sm text-gray-500">View and manage appointments</p>
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
                  <p className="font-medium text-gray-900">My Memberships</p>
                  <p className="text-sm text-gray-500">Manage subscriptions</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToTestimonials}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-pink-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Star className="w-5 h-5 text-pink-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">My Reviews</p>
                  <p className="text-sm text-gray-500">View and edit testimonials</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToProfile}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <User className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Edit Profile</p>
                  <p className="text-sm text-gray-500">Update your information</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToClasses}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Users className="w-5 h-5 text-indigo-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Browse Classes</p>
                  <p className="text-sm text-gray-500">Find group fitness classes</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToTrainers}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-orange-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Target className="w-5 h-5 text-orange-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Find Trainers</p>
                  <p className="text-sm text-gray-500">Book personal training</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToMembershipPlans}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Heart className="w-5 h-5 text-green-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Membership Plans</p>
                  <p className="text-sm text-gray-500">Upgrade your membership</p>
                </div>
              </div>
            </button>
            <button 
              onClick={navigateToAIPlan}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-purple-300 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-purple-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">AI Workout Plan</p>
                  <p className="text-sm text-gray-500">Generate custom workouts</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
