import { useContext, useEffect } from "react";
import { useRouter } from "next/router";
import AuthContext from "../../context/AuthContext";
import DashboardLayout from "../../components/Layouts/DashboardLayout";
import Link from "next/link";
import BlackSkeletonLoader from "../../components/Loaders/BlackSkeletonLoader";

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  const role = typeof window !== "undefined" ? localStorage.getItem("role") : null;
  const name = typeof window !== "undefined" ? localStorage.getItem("name") : null;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) return <BlackSkeletonLoader lines={6} />;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <p className="mb-6">Welcome, {user?.name || name || "Guest"}</p>
    </DashboardLayout>
  );
};

export default Dashboard;
