import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import AuthContext from "../../context/AuthContext";
import MainLayout from "../../components/Layouts/MainLayout";
import Link from "next/link";
import SpinnerLoader from "../../components/Loaders/SpinnerLoader";

const Dashboard = () => {
  const { user, loading, error } = useContext(AuthContext);
  const router = useRouter();

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const name = typeof window !== "undefined" ? localStorage.getItem("name") : null;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return <SpinnerLoader />;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      {error && <div className="alert alert-error mb-4">{error}</div>}

      <p>Welcome, {user?.name || name || "Guest"}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/dashboard/memberships" className="btn btn-outline">My Memberships</Link>
        <Link href="/dashboard/bookings" className="btn btn-outline">My Bookings</Link>
        <Link href="/dashboard/testimonials" className="btn btn-outline">Reviews</Link>
        <Link href="/dashboard/profile" className="btn btn-outline">Profile</Link>
        <Link href="/ai-plan" className="btn btn-outline">AI Plans</Link>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
