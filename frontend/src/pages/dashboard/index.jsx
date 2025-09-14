import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../../context/AuthContext';
import MainLayout from '../../components/Layouts/MainLayout';
import Link from 'next/link';
import SpinnerLoader from '../../components/Loaders/SpinnerLoader';

const Dashboard = () => {
  const { user, loading, error } = useContext(AuthContext); 
  const router = useRouter();

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) return <SpinnerLoader />;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      {user && (
        <>
          <p>Welcome, {user.name}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/plans" className="btn btn-outline">My Memberships</Link>
            <Link href="/dashboard/bookings" className="btn btn-outline">My Bookings</Link>
            <Link href="/profile" className="btn btn-outline">Profile</Link>
            <Link href="/ai-plan" className="btn btn-outline">AI Plans</Link>
          </div>

          {role === "admin" && (
            <Link href="/admin" className="btn btn-primary mt-4">Go to Admin Panel</Link>
          )}
        </>
      )}
    </MainLayout>
  );
};

export default Dashboard;
