import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import AuthContext from "../../context/AuthContext";
import api from "../../utils/axiosInstance";
import MainLayout from "../../components/Layouts/MainLayout";
import TextInput from "../../components/Inputs/TextInput";
import FileInput from "../../components/Inputs/FileInput";
import { API_PATHS } from "../../utils/apiPaths";
import SpinnerLoader from "../../components/Loaders/SpinnerLoader";

const Profile = () => {
  const { user, loading, error, refreshUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", image: null });
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
        });
      }
    }
  }, [loading, user, router]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
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
      alert("Profile updated successfully!");
    } catch (err) {
      setLocalError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user) return <SpinnerLoader />;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {localError && <div className="alert alert-error mb-4">{localError}</div>}

      <div className="card bg-base-100 shadow-xl p-6 max-w-md mx-auto">
        <img
          src={user?.profileImageURL || "/images/default-profile.png"}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <form onSubmit={updateProfile}>
          <TextInput label="Name" name="name" value={formData.name} onChange={handleChange} />
          <TextInput label="Email" name="email" value={formData.email} onChange={handleChange} />
          <TextInput
            label="Password (leave blank to keep unchanged)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
          <FileInput label="Profile Image" name="image" onChange={handleChange} />
          <button className="btn btn-primary w-full mt-4" type="submit" disabled={isUpdating}>
            {isUpdating ? <SpinnerLoader /> : "Update Profile"}
          </button>
        </form>
      </div>
    </MainLayout>
  );
};

export default Profile;
