import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { formatDate } from '../../utils/helpers';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  DollarSign,
  Users,
  X,
  Info,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Power,
  PowerOff,
  Image as ImageIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid3X3
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminClasses = () => {
  const [classes, setClasses] = useState([]);
  const [classStats, setClassStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    inactiveClasses: 0,
    adminDeactivatedClasses: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelDate, setCancelDate] = useState('');
  const [cancelClassId, setCancelClassId] = useState('');
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    trainerID: '',
    schedule: [{ day: '', startTime: '', endTime: '' }],
    capacity: '',
    location: '',
    price: '',
    category: '',
    level: 'Beginner'
  });
  const [files, setFiles] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchClasses();
    fetchTrainers();
    fetchClassStats();
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

  const fetchClasses = async () => {
    try {
      const res = await api.get(API_PATHS.CLASSES.GET_ALL);
      setClasses(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch classes');
    }
  };

  const fetchTrainers = async () => {
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data.map(t => ({ value: t._id, label: t.trainerName })));
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
    }
  };

  const fetchClassStats = async () => {
    try {
      const res = await api.get(API_PATHS.CLASSES.GET_STATS);
      setClassStats(res.data);
    } catch (err) {
      console.error('Failed to fetch class statistics:', err);
    }
  };

  const openImageGallery = (classObj) => {
    // Get images from imageURLs array
    const images = classObj.imageURLs && classObj.imageURLs.length > 0 
      ? classObj.imageURLs 
      : [];
    
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
    Object.keys(formData).forEach(key => {
      if (key === 'schedule') {
        fd.append(key, JSON.stringify(formData[key]));
      } else {
        fd.append(key, formData[key]);
      }
    });
    if (files.length > 0) {
      files.forEach(file => fd.append('images', file));
    }
    try {
      if (formData._id) {
        await api.put(API_PATHS.ADMIN.CLASSES.UPDATE(formData._id), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post(API_PATHS.ADMIN.CLASSES.CREATE, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      setFormData({ className: '', description: '', trainerID: '', schedule: [{ day: '', startTime: '', endTime: '' }], capacity: '', location: '', price: '', category: '', level: 'Beginner' });
      setFiles([]);
      fetchClasses();
      fetchClassStats();
      setLocalError(null);
      toast.success('Class saved successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to save class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteClass = async id => {
    setIsSubmitting(true);
    try {
      await api.delete(API_PATHS.ADMIN.CLASSES.DELETE(id));
      fetchClasses();
      fetchClassStats();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelClass = async () => {
    setIsSubmitting(true);
    try {
      await api.post(API_PATHS.ADMIN.CLASSES.CANCEL_DATE(cancelClassId), { date: cancelDate });
      setIsCancelModalOpen(false);
      setCancelDate('');
      setCancelClassId('');
      fetchClasses();
      fetchClassStats();
      setLocalError(null);
      toast.success('Class cancelled successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to cancel class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activateClass = async (id, date) => {
    setIsSubmitting(true);
    try {
      await api.post(API_PATHS.ADMIN.CLASSES.ACTIVATE_DATE(id), { date });
      fetchClasses();
      fetchClassStats();
      setLocalError(null);
      toast.success('Class activated successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to activate class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deactivateClass = async (id) => {
    setIsSubmitting(true);
    try {
      await api.patch(API_PATHS.ADMIN.CLASSES.DEACTIVATE(id));
      fetchClasses();
      fetchClassStats();
      setLocalError(null);
      toast.success('Class deactivated successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to deactivate class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reactivateClass = async (id) => {
    setIsSubmitting(true);
    try {
      await api.patch(API_PATHS.ADMIN.CLASSES.REACTIVATE(id));
      fetchClasses();
      fetchClassStats();
      setLocalError(null);
      toast.success('Class reactivated successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to reactivate class');
    } finally {
      setIsSubmitting(false);
    }
  };

  const edit = c => {
    setFormData({
      _id: c._id,
      className: c.className,
      description: c.description,
      trainerID: c.trainerID?._id || '',
      schedule: c.schedule || [{ day: '', startTime: '', endTime: '' }],
      capacity: c.capacity,
      location: c.location,
      price: c.price,
      category: c.category,
      level: c.level || 'Beginner'
    });
    setFiles([]);
    setIsModalOpen(true);
  };


  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Class Management</h1>
            <p className="text-white mt-1">Manage gym classes and schedules</p>
          </div>
      <button
        onClick={() => { setFormData({ className: '', description: '', trainerID: '', schedule: [{ day: '', startTime: '', endTime: '' }], capacity: '', location: '', price: '', category: '', level: 'Beginner' }); setFiles([]); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
            <Plus className="w-5 h-5" />
        Create Class
      </button>
        </div>

        {/* Class Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Classes</dt>
                  <dd className="text-lg font-medium text-gray-900">{classStats.totalClasses}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Classes</dt>
                  <dd className="text-lg font-medium text-gray-900">{classStats.activeClasses}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Inactive Classes</dt>
                  <dd className="text-lg font-medium text-gray-900">{classStats.inactiveClasses}</dd>
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
                  <dd className="text-lg font-medium text-gray-900">{classStats.adminDeactivatedClasses}</dd>
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
            {classes.map(c => (
              <div key={c._id} className="border-b border-gray-200 p-4 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{c.className}</h3>
                    <p className="text-xs text-gray-500">{c.category}</p>
                    {c.imageURLs && c.imageURLs.length > 0 && (
                      <div className="mt-2">
                        <button
                          onClick={() => openImageGallery(c)}
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <ImageIcon className="w-4 h-4" />
                          <Eye className="w-4 h-4" />
                          {c.imageURLs.length > 1 ? `View ${c.imageURLs.length} Images` : 'View Image'}
                        </button>
                      </div>
                    )}
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === 'Active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {c.status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                          {c.status}
                        </span>
                      </div>
                      {c.adminDeactivated && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Admin Deactivated
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => edit(c)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {c.adminDeactivated ? (
                      <button
                        onClick={() => reactivateClass(c._id)}
                        disabled={isSubmitting}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => deactivateClass(c._id)}
                        disabled={isSubmitting}
                        className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                      >
                        <PowerOff className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteClass(c._id)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{c.trainer?.trainerName || 'N/A'}</span>
                  </div>
                  
                  {c.capacity && (
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Capacity: {c.capacity}</span>
                    </div>
                  )}
                  
                  {c.price && (
                    <div className="flex items-center text-sm">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span>${c.price}</span>
                    </div>
                  )}
                  
                  {c.location && (
                    <div className="flex items-center text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{c.location}</span>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Class Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                    Trainer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Price
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
          {classes.map(c => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{c.className}</div>
                      {c.capacity && (
                        <div className="text-xs text-gray-500">Capacity: {c.capacity}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {c.description ? (
                          <span className="line-clamp-2">{c.description}</span>
                        ) : (
                          <span className="text-gray-500 italic">No description</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {c.trainer?.trainerName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {c.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                        c.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {c.level || 'Beginner'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="w-4 h-4 mr-1 text-gray-400" />
                        {c.price ? `$${c.price}` : 'Free'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {c.imageURLs && c.imageURLs.length > 0 ? (
                        <button
                          onClick={() => openImageGallery(c)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          title={c.imageURLs.length > 1 ? `View ${c.imageURLs.length} images` : 'View image'}
                        >
                          <ImageIcon className="w-4 h-4" />
                          <Eye className="w-3 h-3" />
                          {c.imageURLs.length > 1 ? (
                            <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                              {c.imageURLs.length}
                            </span>
                          ) : null}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-sm">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            c.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {c.status === 'Active' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                            {c.status}
                          </span>
                        </div>
                        {c.adminDeactivated && (
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
                          onClick={() => edit(c)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit class"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        {c.adminDeactivated ? (
                          <button
                            onClick={() => reactivateClass(c._id)}
                            disabled={isSubmitting}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Reactivate class"
                          >
                            <Power className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => deactivateClass(c._id)}
                            disabled={isSubmitting}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                            title="Deactivate class"
                          >
                            <PowerOff className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteClass(c._id)}
                          disabled={isSubmitting}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete class"
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
          
          {classes.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No classes found</h3>
                <p className="text-gray-500 mb-4">Get started by creating your first gym class.</p>
                <button
                  onClick={() => { setFormData({ className: '', description: '', trainerID: '', schedule: [{ day: '', startTime: '', endTime: '' }], capacity: '', location: '', price: '', category: '', level: 'Beginner' }); setFiles([]); setIsModalOpen(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Your First Class
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
                      {formData._id ? 'Edit Class' : 'Create New Class'}
                    </h2>
                    <p className="text-blue-100 mt-1">
                      {formData._id ? 'Update class details and schedule' : 'Set up a new gym class'}
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
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Name *
                        </label>
                        <input
                          type="text"
                          name="className"
                          value={formData.className}
                          onChange={handleChange}
                          required
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-lg"
                          placeholder="e.g., Yoga Flow"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                          placeholder="Describe what this class offers and who it's for..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trainer *
                          </label>
                          <select
                            name="trainerID"
                            value={formData.trainerID}
                            onChange={handleChange}
                            required
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="">Select a trainer</option>
                            {trainers.map(trainer => (
                              <option key={trainer.value} value={trainer.value}>
                                {trainer.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Level
                          </label>
                          <select
                            name="level"
                            value={formData.level}
                            onChange={handleChange}
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Class Details */}
                  <div className="bg-green-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-green-600 font-bold">2</span>
                      </div>
                      Class Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Capacity *
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          value={formData.capacity}
                          onChange={handleChange}
                          required
                          min="1"
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="20"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price *
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-3 text-gray-500">$</span>
                          <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="25.00"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <input
                          type="text"
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="e.g., Yoga, Cardio, Strength"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="e.g., Studio A, Main Hall"
                      />
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="bg-purple-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold">3</span>
                      </div>
                      Schedule
                    </h3>
                    
                    <div className="space-y-4">
          {formData.schedule.map((slot, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border-2 border-gray-100">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Day
                              </label>
                              <input
                                type="text"
                value={slot.day}
                onChange={e => handleScheduleChange(index, 'day', e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Monday"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Time
                              </label>
                              <input
                type="time"
                value={slot.startTime}
                onChange={e => handleScheduleChange(index, 'startTime', e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Time
                              </label>
                              <input
                type="time"
                value={slot.endTime}
                onChange={e => handleScheduleChange(index, 'endTime', e.target.value)}
                                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
                            </div>
                            <div>
              {formData.schedule.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeScheduleSlot(index)}
                                  className="w-full bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
            </div>
          ))}
                      <button
                        type="button"
                        onClick={addScheduleSlot}
                        className="w-full bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors border-2 border-dashed border-blue-300"
                      >
                        + Add Schedule Slot
                      </button>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="bg-orange-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                        <span className="text-orange-600 font-bold">4</span>
        </div>
                      Class Images
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Upload Images
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFiles(Array.from(e.target.files))}
                        multiple
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Upload multiple images to showcase your class
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
                          Update Class
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Create Class
                        </>
                      )}
        </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Class Modal */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cancel Class</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancel Date
                  </label>
                  <input
          type="date"
          value={cancelDate}
          onChange={e => setCancelDate(e.target.value)}
          required
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setIsCancelModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
        <button
          onClick={cancelClass}
          disabled={isSubmitting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
                    Cancel Class
        </button>
                </div>
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
                  alt={`Class ${currentImageIndex + 1}`}
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

export default AdminClasses;