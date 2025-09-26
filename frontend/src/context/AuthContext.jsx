import { createContext, useState, useEffect } from "react";
import api from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  const isAdmin = role === "admin";

  const attachToken = () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  };

  const refreshUser = async () => {
    if (typeof window === "undefined") return;
    attachToken();
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setRole(null);
      setLoading(false);

      // 🚨 Unauthenticated access redirect
      if (router.pathname.startsWith("/profile") || router.pathname.startsWith("/admin")) {
        router.replace("/auth/login");
      }
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(API_PATHS.AUTH.GET_PROFILE);
      setUser(res.data);
      setRole(res.data.role || localStorage.getItem("role"));
      setError(null);

      // 🚨 Restrict /admin to admin only
      if (router.pathname.startsWith("/admin") && res.data.role !== "admin") {
        router.replace("/dashboard"); // normal users go back to dashboard
      }
    } catch (err) {
      console.error("refreshUser error:", err.response?.data || err.message);
      setUser(null);
      setRole(null);
      setError(err.response?.data?.message || "Failed to fetch user profile");

      // 🚨 Invalid token or error → redirect to login
      if (router.pathname.startsWith("/dashboard") || router.pathname.startsWith("/admin")) {
        router.replace("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    refreshUser();

    if (typeof window !== "undefined") {
      const handleStorageChange = () => {
        setRole(localStorage.getItem("role"));
      };
      window.addEventListener("storage", handleStorageChange);
      return () => {
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await api.post(API_PATHS.AUTH.LOGIN, { email, password });

      const { token, role, name } = res.data;
      if (!token) throw new Error("No token received from server");

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("name", name);
      }

      attachToken();
      setRole(role);
      await refreshUser();

      return res.data;
    } catch (err) {
      console.error("login error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Login failed");
      throw err;
    }
  };

  const register = async (name, email, password) => {
    try {
      setError(null);
      const res = await api.post(API_PATHS.AUTH.REGISTER, {
        name,
        email,
        password,
      });

      const { token } = res.data;
      if (!token) throw new Error("No token received from server");

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
      attachToken();
      await refreshUser();
    } catch (err) {
      console.error("register error:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Registration failed");
      throw err;
    }
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
    }
    attachToken();
    setUser(null);
    setRole(null);
    setError(null);

    router.push("/").then(() => {
      if (typeof window !== "undefined") window.location.reload();
    });
  };

  if (!mounted) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        error,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
