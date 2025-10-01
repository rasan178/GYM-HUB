import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import api from "../utils/axiosInstance";
import MainLayout from "../components/Layouts/MainLayout";
import TextInput from "../components/Inputs/TextInput";
import FileInput from "../components/Inputs/FileInput";
import { API_PATHS } from "../utils/apiPaths";
import SpinnerLoader from "../components/Loaders/SpinnerLoader";
import { User, Mail, Lock, Camera, Calendar, Shield, Activity } from 'lucide-react';

const Profile = () => {
  const { user, loading, error, refreshUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", image: null, previewImage: null });
  const [localError, setLocalError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else {
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          password: "",
          image: null,
          previewImage: null,
        });
      }
    }
  }, [loading, user, router]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (formData.previewImage) {
        URL.revokeObjectURL(formData.previewImage);
      }
    };
  }, [formData.previewImage]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      // Create a preview URL for the selected image
      const file = files[0];
      const previewURL = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, [name]: file, previewImage: previewURL }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    const token = localStorage.getItem("token");
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const fd = new FormData();
    if (formData.name) fd.append("name", formData.name);
    if (formData.email) fd.append("email", formData.email);
    if (formData.password) fd.append("password", formData.password);
    if (formData.image) fd.append("image", formData.image);

    try {
      await api.put(API_PATHS.USERS.UPDATE_PROFILE, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await refreshUser();
      setLocalError(null);
      // Clean up preview URL after successful update
      if (formData.previewImage) {
        URL.revokeObjectURL(formData.previewImage);
        setFormData(prev => ({ ...prev, previewImage: null }));
      }
      alert("Profile updated successfully!");
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <SpinnerLoader />;
  // Block admin access to profile page
  if (user && user.role === 'admin') {
    if (typeof window !== 'undefined') {
      window.location.replace('/admin');
    }
    return null;
  }
  if (!user) return <SpinnerLoader />;

  return (
    <MainLayout>
      <div className="min-h-screen bg-black text-white pt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-gray-300">Manage your account information and preferences</p>
          </div>

          {/* Error Messages */}
          {error && (
            <div className="bg-white text-black border-2 border-white p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span className="font-semibold">{error}</span>
              </div>
            </div>
          )}
          {localError && (
            <div className="bg-white text-black border-2 border-white p-4 mb-6 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                <span className="font-semibold">{localError}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview Card */}
            <div className="lg:col-span-1">
              <div className="bg-white text-black rounded-lg p-6 border-2 border-white">
                <div className="text-center">
                  <div className="relative inline-block group">
                    <img
                      src={formData.previewImage || user?.profileImageURL || "/images/default-profile.png"}
            alt="Profile"
                      className="w-32 h-32 rounded-full border-4 border-black object-cover mx-auto"
                    />
                    <label className="absolute -bottom-2 -right-2 bg-black text-white rounded-full p-2 cursor-pointer hover:bg-gray-800 transition-colors z-10 shadow-lg">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        name="image"
                        onChange={handleChange}
                        accept="image/jpeg,image/png,image/jpg"
                        className="hidden"
                      />
                    </label>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-full transition-all duration-300 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Click to change
                      </span>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mt-4">{user?.name || "User"}</h2>
                  <p className="text-gray-600 flex items-center justify-center mt-2">
                    <Mail className="w-4 h-4 mr-2" />
                    {user?.email}
                  </p>
                  <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Member since {new Date(user?.createdDate || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-white text-black rounded-lg p-6 border-2 border-white">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Account Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Status</span>
                    <span className="text-green-600 font-semibold">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Role</span>
                    <span className="text-black font-semibold capitalize">{user?.role || "User"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-500 text-sm">
                      {new Date(user?.updatedDate || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Personal Information Section */}
              <div className="bg-white text-black rounded-lg p-6 border-2 border-white mb-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <User className="w-6 h-6 mr-2" />
                  Personal Information
                </h3>
                <form onSubmit={updateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <TextInput 
                        label="Full Name" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        icon={<User className="w-5 h-5" />}
                      />
                    </div>
                    <div>
                      <TextInput 
                        label="Email Address" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange}
                        icon={<Mail className="w-5 h-5" />}
                      />
                    </div>
                  </div>
                  
                  <div>
            <TextInput
              label="Password (leave blank to keep unchanged)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
                      icon={<Lock className="w-5 h-5" />}
                    />
                  </div>

                  <div>
                    <FileInput 
                      label="Profile Image" 
                      name="image" 
                      onChange={handleChange}
                      icon={<Camera className="w-5 h-5" />}
                    />
                  </div>

                  <div className="pt-4">
                    <button 
                      className="w-full bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-60 flex items-center justify-center" 
                      type="submit" 
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <SpinnerLoader />
                          <span className="ml-2">Updating...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          Update Profile
                        </>
                      )}
            </button>
                  </div>
          </form>
              </div>

              {/* Account Settings Section */}
              <div className="bg-white text-black rounded-lg p-6 border-2 border-white">
                <h3 className="text-xl font-semibold mb-6 flex items-center">
                  <Shield className="w-6 h-6 mr-2" />
                  Account Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Email Notifications</h4>
                      <p className="text-sm text-gray-600">Receive updates about your bookings and memberships</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                    </div>
                    <button className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors">
                      Enable
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Data Export</h4>
                      <p className="text-sm text-gray-600">Download a copy of your account data</p>
                    </div>
                    <button className="bg-gray-200 text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-300 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
