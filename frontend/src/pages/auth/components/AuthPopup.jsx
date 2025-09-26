// src/components/AuthPopup.jsx
import { useContext, useState } from "react";
import AuthContext from "../../../context/AuthContext";
import { useRouter } from "next/router";
import { X, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const AuthPopup = ({ currentPage, setCurrentPage, onClose }) => {
  const { login, register, error: authError } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [localError, setLocalError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    
    try {
      const loggedInUser = await login(formData.email, formData.password);
      onClose();
      if (loggedInUser.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setLocalError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    
    try {
      await register(formData.name, formData.email, formData.password);
      setCurrentPage("login");
      setFormData({ name: "", email: "", password: "" });
      setLocalError(null);
    } catch (err) {
      setLocalError(
        err.response?.data?.message ||
        err.message ||
        "Failed to register. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const switchToLogin = () => {
    setCurrentPage("login");
    setFormData({ name: "", email: "", password: "" });
    setLocalError(null);
  };

  const switchToRegister = () => {
    setCurrentPage("signup");
    setFormData({ name: "", email: "", password: "" });
    setLocalError(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">
            {currentPage === "login" ? "Login" : "Register"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Error Display */}
          {(localError || authError) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {localError || authError}
            </div>
          )}

          {/* Form */}
          <form onSubmit={currentPage === "login" ? handleLogin : handleRegister} className="space-y-4">
            {/* Name field for register */}
            {currentPage === "signup" && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                  placeholder="Enter your name"
                />
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                placeholder="Enter your email"
              />
            </div>

            {/* Password field */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-black"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  {currentPage === "login" ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Login</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Register</span>
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {/* Switch between login and register */}
          <div className="mt-6 text-center">
            {currentPage === "login" ? (
              <p className="text-black">
                Don't have an account?{" "}
                <button
                  onClick={switchToRegister}
                  className="text-black font-medium hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p className="text-black">
                Already have an account?{" "}
                <button
                  onClick={switchToLogin}
                  className="text-black font-medium hover:underline"
                >
                  Login here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;