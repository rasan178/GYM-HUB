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
  Info,
  Power,
  PowerOff,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Phone
} from 'lucide-react';

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [trainerStats, setTrainerStats] = useState({
    totalTrainers: 0,
    activeTrainers: 0,
    inactiveTrainers: 0,
    adminDeactivatedTrainers: 0
  });
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
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchTrainers();
    fetchTrainerStats();
  }, []);

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (selectedImages.length > 0) {
        if (e.key === 'ArrowLeft') {
          prevImage();
        } else if (e.key === 'ArrowRight') {
          nextImage();
        } else if (e.key === 'Escape') {
          closeImageGallery();
        }
      }
    };

    if (selectedImages.length > 0) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [selectedImages.length, currentImageIndex]);

  const fetchTrainers = async () => {
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
    }
  };

  const fetchTrainerStats = async () => {
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_STATS);
      setTrainerStats(res.data);
    } catch (err) {
      console.error('Failed to fetch trainer statistics:', err);
    }
  };

  const openImageGallery = (trainer) => {
    // Get images from images array or fallback to single image
    const images = trainer.images && trainer.images.length > 0 
      ? trainer.images 
      : (trainer.image ? [trainer.image] : []);
    
    if (images.length > 0) {
      setSelectedImages(images);
      setCurrentImageIndex(0);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev < selectedImages.length - 1 ? prev + 1 : 0
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev > 0 ? prev - 1 : selectedImages.length - 1
    );
  };

  const closeImageGallery = () => {
    setSelectedImages([]);
    setCurrentImageIndex(0);
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
      fetchTrainerStats();
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
      fetchTrainerStats();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deactivateTrainer = async (id) => {
    setIsSubmitting(true);
    try {
      await api.patch(API_PATHS.ADMIN.TRAINERS.DEACTIVATE(id));
      fetchTrainers();
      fetchTrainerStats();
      setLocalError(null);
      alert('Trainer deactivated successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to deactivate trainer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reactivateTrainer = async (id) => {
    setIsSubmitting(true);
    try {
      await api.patch(API_PATHS.ADMIN.TRAINERS.REACTIVATE(id));
      fetchTrainers();
      fetchTrainerStats();
      setLocalError(null);
      alert('Trainer reactivated successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to reactivate trainer');
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
            <h1 className="text-3xl font-bold text-white">Trainer Management</h1>
            <p className="text-white mt-1">Manage gym trainers and instructors</p>
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

        {/* Trainer Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Trainers</dt>
                  <dd className="text-lg font-medium text-gray-900">{trainerStats.totalTrainers}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Trainers</dt>
                  <dd className="text-lg font-medium text-gray-900">{trainerStats.activeTrainers}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-gray-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive Trainers</dt>
                  <dd className="text-lg font-medium text-gray-900">{trainerStats.inactiveTrainers}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Admin Deactivated</dt>
                  <dd className="text-lg font-medium text-gray-900">{trainerStats.adminDeactivatedTrainers}</dd>
                </dl>
              </div>
            </div>
          </div>
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
                    {((t.images && t.images.length > 0) || t.image) && (
                      <div className="mt-2">
                        <button
                          onClick={() => openImageGallery(t)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <Eye className="w-4 h-4" />
                          {(() => {
                            const imageCount = t.images ? t.images.length : (t.image ? 1 : 0);
                            return imageCount > 1 ? `View ${imageCount} Images` : 'View Image';
                          })()}
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {t.status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {t.status}
                        </span>
                      </div>
                      {t.adminDeactivated && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Admin Deactivated
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => edit(t)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {t.adminDeactivated ? (
                      <button
                        onClick={() => reactivateTrainer(t._id)}
                        disabled={isSubmitting}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => deactivateTrainer(t._id)}
                        disabled={isSubmitting}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>
                    )}
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
                  
                  {t.contactInfo?.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{t.contactInfo.phone}</span>
                    </div>
                  )}
                  
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
                    Phone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Specialty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Experience
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
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
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {t.contactInfo?.phone || 'N/A'}
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
                    <td className="px-4 py-4">
                      {((t.images && t.images.length > 0) || t.image) ? (
                        <button
                          onClick={() => openImageGallery(t)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          title={(() => {
                            const imageCount = t.images ? t.images.length : (t.image ? 1 : 0);
                            return imageCount > 1 ? `View ${imageCount} images` : 'View image';
                          })()}
                        >
                          <ImageIcon className="w-4 h-4" />
                          <Eye className="w-3 h-3" />
                          {(() => {
                            const imageCount = t.images ? t.images.length : (t.image ? 1 : 0);
                            return imageCount > 1 ? (
                              <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                {imageCount}
                              </span>
                            ) : null;
                          })()}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            t.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {t.status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {t.status}
                          </span>
                        </div>
                        {t.adminDeactivated && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Admin Deactivated
                          </span>
                        )}
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
                        {t.adminDeactivated ? (
                          <button
                            onClick={() => reactivateTrainer(t._id)}
                            disabled={isSubmitting}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Reactivate trainer"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => deactivateTrainer(t._id)}
                            disabled={isSubmitting}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                            title="Deactivate trainer"
                          >
                            <PowerOff className="w-4 h-4" />
                          </button>
                        )}
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

                  {/* Schedule */}
                  <div className="bg-indigo-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-indigo-600 font-bold">3</span>
                      </div>
                      Working Schedule
                    </h3>
                    
                    <div className="space-y-4">
                      {formData.schedule.map((slot, index) => (
                        <div key={index} className="bg-white border-2 border-indigo-200 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900">Schedule Slot {index + 1}</h4>
                            {formData.schedule.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeScheduleSlot(index)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                                title="Remove this schedule slot"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Day(s) *
                              </label>
                              <select
                                value={slot.day}
                                onChange={e => handleScheduleChange(index, 'day', e.target.value)}
                                required
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              >
                                <option value="">Select Day(s)</option>
                                <option value="Mon">Monday</option>
                                <option value="Tue">Tuesday</option>
                                <option value="Wed">Wednesday</option>
                                <option value="Thu">Thursday</option>
                                <option value="Fri">Friday</option>
                                <option value="Sat">Saturday</option>
                                <option value="Sun">Sunday</option>
                                <option value="Mon,Tue,Wed,Thu,Fri">Weekdays</option>
                                <option value="Sat,Sun">Weekend</option>
                                <option value="Mon,Tue,Wed,Thu,Fri,Sat,Sun">Every Day</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time *
                              </label>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={e => handleScheduleChange(index, 'startTime', e.target.value)}
                                required
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time *
                              </label>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={e => handleScheduleChange(index, 'endTime', e.target.value)}
                                required
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addScheduleSlot}
                        className="w-full border-2 border-dashed border-indigo-300 rounded-lg px-4 py-3 text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Schedule Slot
                      </button>
                    </div>
                    
                    <div className="mt-4 p-3 bg-indigo-100 rounded-lg">
                      <p className="text-sm text-indigo-700">
                        <strong>Note:</strong> The trainer's status will automatically change to "Active" during scheduled hours and "Inactive" outside these hours.
                      </p>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">4</span>
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
                        <span className="text-orange-600 font-bold">5</span>
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

        {/* Image Gallery Modal */}
        {selectedImages.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
            <div className="relative max-w-6xl max-h-full w-full h-full flex flex-col">
              {/* Header */}
              <div className="flex justify-between items-center text-white mb-4">
                <div className="flex items-center gap-2">
                  <Grid3X3 className="w-5 h-5" />
                  <span className="text-lg font-medium">
                    Image {currentImageIndex + 1} of {selectedImages.length}
                  </span>
                </div>
                <button
                  onClick={closeImageGallery}
                  className="text-white hover:text-gray-300 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Main Image */}
              <div className="flex-1 flex items-center justify-center relative">
                <img
                  src={selectedImages[currentImageIndex]}
                  alt={`Trainer ${currentImageIndex + 1}`}
                  className="max-w-[90vw] max-h-[70vh] w-auto h-auto object-contain rounded-lg shadow-lg"
                />
                
                {/* Navigation Arrows */}
                {selectedImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Navigation */}
              {selectedImages.length > 1 && (
                <div className="flex justify-center gap-2 mt-4 overflow-x-auto pb-2">
                  {selectedImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{ minWidth: '64px', minHeight: '64px' }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Keyboard Navigation Info */}
              {selectedImages.length > 1 && (
                <div className="text-center text-white text-sm mt-2 opacity-75">
                  Use ← → arrow keys or click thumbnails to navigate
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTrainers;