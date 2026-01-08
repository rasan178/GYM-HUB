import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthContext from "../context/AuthContext";
import api from "../utils/axiosInstance";
import MainLayout from "../components/Layouts/MainLayout";
import TextInput from "../components/Inputs/TextInput";
import FileInput from "../components/Inputs/FileInput";
import { API_PATHS } from "../utils/apiPaths";
import SpinnerLoader from "../components/Loaders/SpinnerLoader";
import toast from 'react-hot-toast';
import { User, Mail, Lock, Camera, Calendar, Shield, Activity, Phone, Trash2, AlertTriangle, X, Check } from 'lucide-react';

const Profile = () => {
  const { user, loading, error, refreshUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: "", email: "", phoneNumber: "", password: "", image: null, previewImage: null });
  const [initialFormData, setInitialFormData] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [membership, setMembership] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else {
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phoneNumber: user?.phoneNumber || "",
          password: "",
          image: null,
          previewImage: null,
        });
        setInitialFormData({
          name: user?.name || "",
          email: user?.email || "",
          phoneNumber: user?.phoneNumber || "",
          image: null,
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

  // Fetch user's membership (most recent) to display plan name
  useEffect(() => {
    const fetchMembership = async () => {
      if (!user) return;
      try {
        const token = localStorage.getItem('token');
        if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const res = await api.get(API_PATHS.MEMBERSHIPS.GET_ALL);
        const items = res.data?.memberships || res.data?.memberships || res.data?.memberships;
        // API returns memberships array under `memberships` (per controller)
        const memberships = res.data?.memberships || res.data || [];
        if (Array.isArray(memberships) && memberships.length > 0) {
          setMembership(memberships[0]);
        } else {
          setMembership(null);
        }
      } catch (err) {
        // ignore silently
        setMembership(null);
      }
    };
    fetchMembership();
  }, [user]);

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
    if (formData.phoneNumber) fd.append("phoneNumber", formData.phoneNumber);
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
      // update initial values so the form is considered not-changed
      setInitialFormData({ name: formData.name, email: formData.email, phoneNumber: formData.phoneNumber, image: null });
      toast.success("Profile updated successfully!");
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const removeProfileImage = async () => {
    setIsRemovingImage(true);
    setLocalError(null);

    const token = localStorage.getItem("token");
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    try {
      await api.delete(API_PATHS.USERS.REMOVE_PROFILE_IMAGE);
      await refreshUser();
      setShowRemoveConfirm(false);
      setLocalError(null);
      // Clean up any preview image
      if (formData.previewImage) {
        URL.revokeObjectURL(formData.previewImage);
        setFormData(prev => ({ ...prev, previewImage: null, image: null }));
      }
      toast.success("Profile image removed successfully!");
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to remove profile image");
    } finally {
      setIsRemovingImage(false);
    }
  };

  const hasCustomImage = user?.profileImageURL && !user.profileImageURL.includes('/images/default-profile.svg');

  // check if the user modified any fields compared to initial load
  const isChanged = (() => {
    if (!initialFormData) return false;
    if (formData.name !== (initialFormData.name || "")) return true;
    if (formData.email !== (initialFormData.email || "")) return true;
    if (formData.phoneNumber !== (initialFormData.phoneNumber || "")) return true;
    if (formData.image) return true;
    if (formData.password && formData.password.trim() !== "") return true;
    return false;
  })();

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
              <div className="bg-gradient-to-br from-white to-gray-50 text-black rounded-2xl p-8 border-2 border-black shadow-2xl">
                <div className="text-center">
                  <div className="relative inline-block group">
                    <div className="relative">
                      <img
                        src={formData.previewImage || user?.profileImageURL || "/images/default-profile.svg"}
                        alt="Profile"
                        className="w-36 h-36 rounded-full border-4 border-black object-cover mx-auto shadow-xl transition-all duration-300 group-hover:scale-105"
                      />
                      
                      {/* Image overlay with actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center space-y-2">
                          <span className="text-white text-sm font-bold bg-black bg-opacity-70 px-3 py-1 rounded-full">
                            Change Photo
                          </span>
                        </div>
                      </div>

                      {/* Camera button */}
                      <label className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-3 cursor-pointer hover:from-blue-700 hover:to-purple-700 transition-all duration-300 z-20 shadow-xl hover:shadow-2xl transform hover:scale-110">
                        <Camera className="w-5 h-5" />
                        <input
                          type="file"
                          name="image"
                          onChange={handleChange}
                          accept="image/jpeg,image/png,image/jpg"
                          className="hidden"
                        />
                      </label>

                      {/* Remove button - only show if user has custom image */}
                      {hasCustomImage && (
                        <button
                          onClick={() => setShowRemoveConfirm(true)}
                          className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full p-2 hover:from-red-600 hover:to-red-700 transition-all duration-300 z-20 shadow-xl hover:shadow-2xl transform hover:scale-110"
                          title="Remove profile image"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h2 className="text-3xl font-black mt-6 text-black">{user?.name || "User"}</h2>
                  <div className="mt-4 space-y-2">
                    <p className="text-gray-700 flex items-center justify-center text-sm">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="font-medium">{user?.email}</span>
                    </p>
                    {user?.phoneNumber && (
                      <p className="text-gray-700 flex items-center justify-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-green-600" />
                        <span className="font-medium">{user.phoneNumber}</span>
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-center text-sm text-gray-600 bg-gray-100 rounded-full px-4 py-2">
                      <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                      <span className="font-medium">Member since {new Date(user?.createdDate || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="mt-6 bg-gradient-to-br from-white to-gray-50 text-black rounded-2xl p-6 border-2 border-black shadow-xl">
                <h3 className="text-xl font-black mb-6 flex items-center text-black">
                  <Activity className="w-6 h-6 mr-3 text-blue-600" />
                  Account Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl border border-green-200">
                    <span className="text-gray-700 font-medium">Account Status</span>
                    <span className="text-green-700 font-black bg-green-100 px-3 py-1 rounded-full text-sm">Active</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl border border-blue-200">
                    <span className="text-gray-700 font-medium">Membership</span>
                    <span className="text-blue-700 font-black bg-blue-100 px-3 py-1 rounded-full text-sm">{membership?.planName || membership?.planID?.planName || 'No membership'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <span className="text-gray-700 font-medium">Last Updated</span>
                    <span className="text-purple-700 font-medium text-sm">
                      {new Date(user?.updatedDate || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Personal Information Section */}
              <div className="bg-gradient-to-br from-white to-gray-50 text-black rounded-2xl p-8 border-2 border-black shadow-xl mb-6">
                <h3 className="text-2xl font-black mb-8 flex items-center text-black">
                  <User className="w-7 h-7 mr-3 text-blue-600" />
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
                      label="Phone Number" 
                      name="phoneNumber" 
                      value={formData.phoneNumber} 
                      onChange={handleChange}
                      icon={<Phone className="w-5 h-5" />}
                      placeholder="Enter your phone number"
                    />
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

                  <div className="pt-6">
                    <button 
                      className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-4 px-8 rounded-xl font-black text-lg hover:from-gray-800 hover:to-black transition-all duration-300 disabled:opacity-60 flex items-center justify-center shadow-xl hover:shadow-2xl transform hover:scale-[1.02]" 
                      type="submit" 
                      disabled={!isChanged || isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <SpinnerLoader />
                          <span className="ml-3">Updating Profile...</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-6 h-6 mr-3" />
                          Update Profile
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              
            </div>
          </div>
        </div>

        {/* Remove Image Confirmation Dialog */}
        {showRemoveConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full border-4 border-red-200 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-black text-black mb-4">Remove Profile Image?</h3>
                <p className="text-gray-700 mb-8">
                  Are you sure you want to remove your profile image? This will reset it to the default avatar.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowRemoveConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-xl font-bold hover:bg-gray-300 transition-all duration-300 flex items-center justify-center"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={removeProfileImage}
                    disabled={isRemovingImage}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all duration-300 disabled:opacity-60 flex items-center justify-center"
                  >
                    {isRemovingImage ? (
                      <>
                        <SpinnerLoader />
                        <span className="ml-2">Removing...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-5 h-5 mr-2" />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
