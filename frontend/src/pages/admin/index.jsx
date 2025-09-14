import { useContext, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/Layouts/AdminLayout';
import Link from 'next/link';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';

const AdminDashboard = () => {
  const {loading, error } = useContext(AuthContext);

  if (loading) return <SpinnerLoader />;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/admin/users" className="btn btn-outline">Manage Users</Link>
        <Link href="/admin/trainers" className="btn btn-outline">Manage Trainers</Link>
        <Link href="/admin/classes" className="btn btn-outline">Manage Classes</Link>
        <Link href="/admin/memberships" className="btn btn-outline">Manage Memberships</Link>
        <Link href="/admin/bookings" className="btn btn-outline">Manage Bookings</Link>
        <Link href="/admin/testimonials" className="btn btn-outline">Manage Testimonials</Link>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;