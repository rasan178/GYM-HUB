import { createContext, useState, useEffect } from "react";
import api from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false); // prevent hydration issues
  const Router = useRouter();

  const isAdmin = user?.role === "admin";

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
    if (typeof window === "undefined") return; // SSR guard
    attachToken();
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await api.get(API_PATHS.AUTH.GET_PROFILE);
      setUser(res.data);
      setError(null);
    } catch (err) {
      console.error("refreshUser error:", err.response?.data || err.message);
      setUser(null);
      setError(err.response?.data?.message || "Failed to fetch user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true); // mark client-side render
    refreshUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const res = await api.post(API_PATHS.AUTH.LOGIN, { email, password });

      const token = res.data.token;
      const role = res.data.role;
      const name = res.data.name;
      if (!token) throw new Error("No token received from server");

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("name", name);
      }

      attachToken();

      await refreshUser(); // ✅ ensures user is set in context immediately

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
      const token = res.data.token;
      if (!token) throw new Error("No token received from server");

      if (typeof window !== "undefined") {
        localStorage.setItem("token", token);
      }
      attachToken();
      await refreshUser();
    } catch (err) {
      console.error("register error:", err.response?.data || err.message);
      setError(
        err.response?.data?.message || err.message || "Registration failed"
      );
      throw err;
    }
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
    }
    attachToken(); // remove header
    setUser(null);
    setError(null);
    Router.push("/auth/login").then(() => {
      if (typeof window !== "undefined") window.location.reload();
    });
  };

  // prevent hydration mismatch by not rendering children until mounted
  if (!mounted) {
    return null; // or <div>Loading...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
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
