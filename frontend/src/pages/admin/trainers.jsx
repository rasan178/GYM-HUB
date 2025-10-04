import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Mail,
  Award,
  Users,
  X,
  Info
} from 'lucide-react';

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    trainerName: '',
    email: '',
    specialty: '',
    experience: '',
    qualifications: '',
    bio: '',
    schedule: [{ day: '', startTime: '', endTime: '' }],
    contactInfo: { phone: '', address: '' },
    socialLinks: { facebook: '', instagram: '', linkedin: '' }
  });
  const [file, setFile] = useState(null);
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setFormData(prev => {
      const newSchedule = [...prev.schedule];
      newSchedule[index] = { ...newSchedule[index], [field]: value };
      return { ...prev, schedule: newSchedule };
    });
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: '', startTime: '', endTime: '' }]
    }));
  };

  const removeScheduleSlot = (index) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const createOrUpdate = async () => {
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('trainerName', formData.trainerName);
    fd.append('email', formData.email);
    fd.append('specialty', formData.specialty);
    fd.append('experience', formData.experience);
    fd.append('qualifications', formData.qualifications);
    fd.append('bio', formData.bio);
    fd.append('schedule', JSON.stringify(formData.schedule));
    fd.append('contactInfo', JSON.stringify(formData.contactInfo));
    fd.append('socialLinks', JSON.stringify(formData.socialLinks));
    if (file) fd.append('image', file);
    try {
      if (formData._id) {
        await api.put(API_PATHS.ADMIN.TRAINERS.UPDATE(formData._id), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post(API_PATHS.ADMIN.TRAINERS.CREATE, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      setFormData({
        trainerName: '',
        email: '',
        specialty: '',
        experience: '',
        qualifications: '',
        bio: '',
        schedule: [{ day: '', startTime: '', endTime: '' }],
        contactInfo: { phone: '', address: '' },
        socialLinks: { facebook: '', instagram: '', linkedin: '' }
      });
      setFile(null);
      fetchTrainers();
      setLocalError(null);
      alert('Trainer saved successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to save trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTrainer = async (id) => {
    setIsSubmitting(true);
    try {
      await api.delete(API_PATHS.ADMIN.TRAINERS.DELETE(id));
      fetchTrainers();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const edit = t => {
    setFormData({
      _id: t._id,
      trainerName: t.trainerName,
      email: t.email,
      specialty: Array.isArray(t.specialty) ? t.specialty.join(', ') : t.specialty,
      experience: t.experience,
      qualifications: t.qualifications,
      bio: t.bio,
      schedule: t.schedule || [{ day: '', startTime: '', endTime: '' }],
      contactInfo: t.contactInfo,
      socialLinks: t.socialLinks
    });
    setFile(null);
    setIsModalOpen(true);
  };


  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Trainer Management</h1>
            <p className="text-gray-600 mt-1">Manage gym trainers and instructors</p>
          </div>
      <button
        onClick={() => {
          setFormData({
            trainerName: '',
            email: '',
            specialty: '',
            experience: '',
            qualifications: '',
            bio: '',
            schedule: [{ day: '', startTime: '', endTime: '' }],
            contactInfo: { phone: '', address: '' },
            socialLinks: { facebook: '', instagram: '', linkedin: '' }
          });
          setFile(null);
          setIsModalOpen(true);
        }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
            <Plus className="w-5 h-5" />
        Create Trainer
      </button>
        </div>

        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {localError}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {trainers.map(t => (
              <div key={t._id} className="border-b border-gray-200 p-4 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {t.trainerName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {Array.isArray(t.specialty) ? t.specialty.join(', ') : (t.specialty || 'General Training')}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => edit(t)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTrainer(t._id)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{t.email}</span>
                  </div>
                  
                  {t.experience && (
                    <div className="flex items-center text-sm">
                      <Award className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{t.experience} years experience</span>
                    </div>
                  )}
                  
                  {t.bio && (
                    <div className="text-sm text-gray-600">
                      <span className="line-clamp-2">{t.bio}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Trainer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Specialty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Experience
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
          {trainers.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {t.trainerName}
                      </div>
                      {t.bio && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{t.bio}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {t.email}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">
                        {Array.isArray(t.specialty) && t.specialty.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {t.specialty.slice(0, 2).map((spec, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {spec}
                              </span>
                            ))}
                            {t.specialty.length > 2 && (
                              <span className="text-xs text-gray-500">+{t.specialty.length - 2} more</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">
                            {Array.isArray(t.specialty) ? 'General Training' : (t.specialty || 'General Training')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Award className="w-4 h-4 mr-2 text-gray-400" />
                        {t.experience ? `${t.experience} years` : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                        <button
                          onClick={() => edit(t)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit trainer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                <button
                  onClick={() => deleteTrainer(t._id)}
                  disabled={isSubmitting}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete trainer"
                >
                          <Trash2 className="w-4 h-4" />
                </button>
                      </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
          </div>
          
          {trainers.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No trainers found</h3>
                <p className="text-gray-500 mb-4">Get started by adding your first trainer.</p>
                <button
                  onClick={() => {
                    setFormData({
                      trainerName: '',
                      email: '',
                      specialty: '',
                      experience: '',
                      qualifications: '',
                      bio: '',
                      schedule: [{ day: '', startTime: '', endTime: '' }],
                      contactInfo: { phone: '', address: '' },
                      socialLinks: { facebook: '', instagram: '', linkedin: '' }
                    });
                    setFile(null);
                    setIsModalOpen(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Trainer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl transform transition-all">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {formData._id ? 'Edit Trainer' : 'Create New Trainer'}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {formData._id ? 'Update trainer details and information' : 'Add a new trainer to your gym team'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-blue-200 transition-colors p-2 hover:bg-white hover:bg-opacity-20 rounded-full"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto max-h-[calc(95vh-140px)]">
                {localError && (
                  <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r-md mb-6 flex items-center">
                    <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                    <span>{localError}</span>
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); createOrUpdate(); }} className="space-y-8">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-bold">1</span>
                      </div>
                      Basic Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Trainer Name *
                        </label>
                        <input
                          type="text"
                          name="trainerName"
                          value={formData.trainerName}
                          onChange={handleChange}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          placeholder="John Doe"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          placeholder="john@example.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialty (comma separated)
                        </label>
                        <input
                          type="text"
                          name="specialty"
                          value={formData.specialty}
                          onChange={handleChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Weight Training, Cardio, Yoga"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Experience (years)
                        </label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          min="0"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Tell us about the trainer's background and expertise..."
                      />
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualifications
                      </label>
                      <textarea
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        rows={2}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        placeholder="Certifications, degrees, achievements..."
                      />
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      Contact Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={formData.contactInfo.phone}
                          onChange={e => handleNestedChange('contactInfo', 'phone', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address
                        </label>
                        <input
                          type="text"
                          value={formData.contactInfo.address}
                          onChange={e => handleNestedChange('contactInfo', 'address', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="123 Main St, City, State"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      Social Links
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook
                        </label>
                        <input
                          type="url"
                          value={formData.socialLinks.facebook}
                          onChange={e => handleNestedChange('socialLinks', 'facebook', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="https://facebook.com/username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={formData.socialLinks.instagram}
                          onChange={e => handleNestedChange('socialLinks', 'instagram', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="https://instagram.com/username"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={formData.socialLinks.linkedin}
                          onChange={e => handleNestedChange('socialLinks', 'linkedin', e.target.value)}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="https://linkedin.com/in/username"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-orange-600 font-bold">4</span>
                      </div>
                      Profile Image
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Profile Picture
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files[0])}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended: Square image, at least 300x300 pixels
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium"
                    >
                      Cancel
                    </button>
        <button
                      type="submit"
          disabled={isSubmitting}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2 transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                      {formData._id ? (
                        <>
                          <Edit className="w-4 h-4" />
                          Update Trainer
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Trainer
                        </>
                      )}
        </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTrainers;