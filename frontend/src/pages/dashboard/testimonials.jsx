import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import DashboardLayout from '../../components/Layouts/DashboardLayout';
import { useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import TextInput from '../../components/Inputs/TextInput';
import FileInput from '../../components/Inputs/FileInput';
import Modal from '../../components/Modal';
import { API_PATHS } from '../../utils/apiPaths';
import { canEditTestimonial, getDaysRemainingToEdit } from '../../utils/helpers';
import { 
  MessageSquare, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Edit,
  Plus,
  Users,
  User,
  Image as ImageIcon,
  Eye,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  X,
  Trash2
} from 'lucide-react';

const Testimonials = () => {
  const { user, error } = useContext(AuthContext);
  const [testimonials, setTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ message: '', rating: '', userRole: '', images: [] });
  const [localError, setLocalError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAction, setIsAction] = useState({});

  useEffect(() => {
    fetchTestimonials();
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

  const fetchTestimonials = async () => {
    try {
      // Only fetch user's own testimonials
      const myTestimonialsRes = await api.get(API_PATHS.TESTIMONIALS.GET_MY);
      const myTestimonials = myTestimonialsRes.data || [];
      
      setTestimonials(myTestimonials);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch testimonials');
    }
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? Array.from(files) : value
    }));
  };

  const submitTestimonial = async () => {
    // Frontend validation to match backend validation
    if (!formData.message?.trim()) {
      setLocalError('Message is required');
      return;
    }
    
    if (!formData.rating || formData.rating === '') {
      setLocalError('Rating is required');
      return;
    }
    
    const rating = parseInt(formData.rating);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      setLocalError('Rating must be between 1 and 5');
      return;
    }
    
    if (!formData.userRole?.trim()) {
      setLocalError('Your role/job is required');
      return;
    }
    
    // Validate image count
    if (formData.images && formData.images.length > 5) {
      setLocalError('Maximum 5 images allowed per testimonial');
      return;
    }
    
    setIsSubmitting(true);
    setLocalError(null); // Clear any previous errors
    
    const fd = new FormData();
    fd.append('message', formData.message.trim());
    fd.append('rating', rating);
    fd.append('userRole', formData.userRole.trim());
    
    // Handle multiple images
    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((image, index) => {
        fd.append('images', image);
      });
    }
    
    try {
      if (formData._id) {
        await api.put(API_PATHS.TESTIMONIALS.UPDATE(formData._id), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post(API_PATHS.TESTIMONIALS.CREATE, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      setFormData({ message: '', rating: '', userRole: '', images: [] });
      fetchTestimonials();
      setLocalError(null);
      alert('Testimonial submitted successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to submit testimonial');
    } finally {
      setIsSubmitting(false);
    }
  };

  const editTestimonial = (t) => {
    if (!canEditTestimonial(t.createdAt)) {
      const daysExpired = Math.floor((new Date() - new Date(t.createdAt)) / (1000 * 60 * 60 * 24)) - 10;
      setLocalError(`Cannot edit testimonial. The 10-day editing period has expired ${daysExpired} day(s) ago.`);
      return;
    }
    
    // Clear any previous errors when opening edit modal
    setLocalError(null);
    
    setFormData({
      _id: t._id,
      message: t.message,
      rating: t.rating,
      userRole: t.userRole,
      images: []
    });
    setIsModalOpen(true);
  };

  const deleteTestimonial = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial? This action cannot be undone.')) {
      return;
    }
    
    setIsAction(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await api.delete(API_PATHS.TESTIMONIALS.DELETE(id));
      fetchTestimonials();
      setLocalError(null);
      alert('Testimonial deleted successfully!');
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete testimonial. You can only delete your own testimonials.');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  const openImageGallery = (testimonial) => {
    // Get images from imageURLs array or fallback to single imageURL
    const images = testimonial.imageURLs && testimonial.imageURLs.length > 0 
      ? testimonial.imageURLs 
      : (testimonial.imageURL ? [testimonial.imageURL] : []);
    
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved': return <CheckCircle className="w-4 h-4" />;
      case 'Pending': return <AlertTriangle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };


  // Calculate testimonial statistics - only user's own testimonials
  const userTestimonials = testimonials; // Already filtered to user's own
  const approvedTestimonials = userTestimonials.filter(t => t.status === 'Approved').length;
  const pendingTestimonials = userTestimonials.filter(t => t.status === 'Pending').length;
  const totalTestimonials = userTestimonials.length;

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Testimonials</h1>
            <p className="text-white mt-1">Manage and track your testimonials</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white">
            <Users className="w-4 h-4 color-white" />
            <span>{userTestimonials.length} my testimonials</span>
          </div>
        </div>

        {/* Testimonial Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">My Reviews</dt>
                  <dd className="text-sm font-medium text-gray-900">{userTestimonials.length}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-sm font-medium text-gray-900">{approvedTestimonials}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-sm font-medium text-gray-900">{userTestimonials.filter(t => t.status === 'Rejected').length}</dd>
                </dl>
              </div>
            </div>
          </div>



          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-sm font-medium text-gray-900">{pendingTestimonials}</dd>
                </dl>
              </div>
            </div>
          </div>

          <button 
            className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200 w-full text-left"
            onClick={() => { 
              setFormData({ message: '', rating: '', userRole: '', images: [] }); 
              setLocalError(null); 
              setIsModalOpen(true); 
            }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Add New</dt>
                  <dd className="text-sm font-medium text-gray-900">Review</dd>
                </dl>
              </div>
            </div>
          </button>

        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {localError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {localError}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {testimonials.map(t => (
              <div key={t._id} className="border-b border-gray-200 p-4 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {t.userName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{t.userRole}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(t.status)}`}>
                      {getStatusIcon(t.status)}
                      {t.status}
                    </span>
                    <div className="flex space-x-2">
                        <button
                          onClick={() => editTestimonial(t)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit testimonial"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteTestimonial(t._id)}
                          disabled={isAction[t._id] === 'delete'}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Delete testimonial"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-start text-sm">
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{t.message}</p>
                  </div>
                  {t.rating && (
                    <div className="flex items-center mt-2">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{t.rating}/5</span>
                    </div>
                  )}
                  {user && String(t.userID) === String(user._id) && (
                    <div className="mt-2">
                      {canEditTestimonial(t.createdAt) ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Edit className="w-3 h-3 mr-1" />
                          {getDaysRemainingToEdit(t.createdAt)} days left to edit
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          <X className="w-3 h-3 mr-1" />
                          Edit period expired
                        </span>
                      )}
                    </div>
                  )}
                  {((t.imageURLs && t.imageURLs.length > 0) || t.imageURL) && (
                    <div className="mt-3">
                      <button
                        onClick={() => openImageGallery(t)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ImageIcon className="w-4 h-4" />
                        <Eye className="w-4 h-4" />
                        {(() => {
                          const imageCount = t.imageURLs ? t.imageURLs.length : (t.imageURL ? 1 : 0);
                          return imageCount > 1 ? `View ${imageCount} Images` : 'View Image';
                        })()}
                      </button>
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
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">
                    Message
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {testimonials.map(t => (
                  <tr key={t._id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {t.userName}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-600">
                        {t.userRole}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        <p className="line-clamp-3">{t.message}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {t.rating ? (
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900">{t.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No rating</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {((t.imageURLs && t.imageURLs.length > 0) || t.imageURL) ? (
                        <button
                          onClick={() => openImageGallery(t)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          title={(() => {
                            const imageCount = t.imageURLs ? t.imageURLs.length : (t.imageURL ? 1 : 0);
                            return imageCount > 1 ? `View ${imageCount} images` : 'View image';
                          })()}
                        >
                          <ImageIcon className="w-4 h-4" />
                          <Eye className="w-3 h-3" />
                          {(() => {
                            const imageCount = t.imageURLs ? t.imageURLs.length : (t.imageURL ? 1 : 0);
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
                      <div className="space-y-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(t.status)}`}>
                          {getStatusIcon(t.status)}
                          {t.status}
                        </span>
                        {user && String(t.userID) === String(user._id) && (
                          <div>
                            {canEditTestimonial(t.createdAt) ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Edit className="w-3 h-3 mr-1" />
                                {getDaysRemainingToEdit(t.createdAt)} days left
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                <X className="w-3 h-3 mr-1" />
                                Edit expired
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-1">
                          <button
                            onClick={() => editTestimonial(t)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="Edit testimonial"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteTestimonial(t._id)}
                            disabled={isAction[t._id] === 'delete'}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                            title="Delete testimonial"
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
          
          {testimonials.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No testimonials found</h3>
                <p className="text-gray-500">You haven't submitted any testimonials yet.</p>
                {user && (
                  <button
                    onClick={() => { 
                      setFormData({ message: '', rating: '', userRole: '', images: [] }); 
                      setLocalError(null); // Clear any previous errors
                      setIsModalOpen(true); 
                    }}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center mx-auto mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Submit First Testimonial
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

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
                  alt={`Testimonial ${currentImageIndex + 1}`}
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <div className="bg-white p-4 md:p-8 rounded-xl shadow-2xl max-w-2xl mx-auto max-h-[90vh] overflow-y-auto w-full mx-4 md:mx-auto">
          {/* Header Section with Gradient */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="bg-blue-600 p-3 md:p-4 rounded-xl mr-3 md:mr-4 shadow-lg">
                <MessageSquare className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-black">
                  {formData._id ? 'Edit Your Testimonial' : 'Share Your Experience'}
                </h3>
                <p className="text-xs md:text-sm text-blue-600 font-medium">
                  {formData._id ? 'Update Mode' : 'Create New Review'}
                </p>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-black text-sm leading-relaxed">
                {formData._id 
                  ? 'Update your testimonial below. Note: Editing will reset the status to "Pending" for re-approval.'
                  : 'Tell others about your fitness journey and help them make informed decisions. Your review helps the community!'
                }
              </p>
            </div>
          </div>

          {/* Form Section */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-white space-y-4 md:space-y-6">
            <div>
              <TextInput 
                label="Your Experience" 
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                placeholder="Share your fitness journey, results, and experience with this gym..."
                required 
              />
              <div className="flex items-center mt-2 p-2 bg-green-50 rounded-md">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <p className="text-xs text-green-700 font-medium">Be honest and detailed about your experience</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center space-x-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="focus:outline-none transition-transform duration-150 hover:scale-110"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= (formData.rating || 0) 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-400 hover:text-yellow-300'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-black mb-2">
                <span>Poor</span>
                <span className="font-medium">Your Rating: {formData.rating || 0}/5</span>
                <span>Excellent</span>
              </div>
              <div className="flex items-center mt-2 p-2 bg-yellow-50 rounded-md">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                <p className="text-xs text-yellow-700 font-medium">Click on stars to rate your experience</p>
              </div>
            </div>

            <div>
              <TextInput 
                label="Your Role/Position" 
                name="userRole" 
                value={formData.userRole} 
                onChange={handleChange} 
                placeholder="e.g., Personal Trainer, Student, Office Worker, Athlete..."
                required 
              />
              <div className="flex items-center mt-2 p-2 bg-purple-50 rounded-md">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <p className="text-xs text-purple-700 font-medium">Help others understand your perspective and background</p>
              </div>
            </div>

            <div>
              <FileInput 
                label="Photos (Optional)" 
                name="images" 
                multiple 
                onChange={handleChange} 
              />
              <div className="flex items-center mt-2 p-2 bg-indigo-50 rounded-md">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3"></div>
                <p className="text-xs text-indigo-700 font-medium">Add up to 5 photos of your progress, gym facilities, or workouts</p>
              </div>
            </div>
          </div>

          {/* Error Section */}
          {localError && (
            <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-3" />
                <p className="text-red-800 text-sm font-semibold">{localError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button 
              className="flex-1 bg-white hover:bg-white border-2 border-black text-black px-6 py-3 rounded-lg transition-all duration-200 font-semibold text-sm flex items-center justify-center"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button 
              className="flex-1 bg-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg" 
              onClick={submitTestimonial} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span>Submitting...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  {formData._id ? (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Testimonial
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Testimonial
                    </>
                  )}
                </div>
              )}
            </button>
          </div>
        </div>
      </Modal>

    </DashboardLayout>
  );
};

export default Testimonials;