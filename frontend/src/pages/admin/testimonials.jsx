import { useEffect, useState } from 'react';
import api from '../../utils/axiosInstance';
import AdminLayout from '../../components/Layouts/AdminLayout';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  User, 
  MessageSquare,
  AlertCircle,
  Users,
  Info,
  Star,
  TrendingUp,
  Image as ImageIcon,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Grid3X3
} from 'lucide-react';

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [testimonialStats, setTestimonialStats] = useState({
    totalTestimonials: 0,
    pendingTestimonials: 0,
    approvedTestimonials: 0,
    rejectedTestimonials: 0,
    averageRating: 0,
    ratedTestimonials: 0
  });
  const [localError, setLocalError] = useState(null);
  const [isAction, setIsAction] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
    fetchTestimonialStats();
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
      const res = await api.get(API_PATHS.ADMIN.TESTIMONIALS.GET_ALL);
      setTestimonials(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch testimonials');
    }
  };

  const fetchTestimonialStats = async () => {
    try {
      const res = await api.get(API_PATHS.TESTIMONIALS.GET_STATS);
      setTestimonialStats(res.data);
    } catch (err) {
      console.error('Failed to fetch testimonial statistics:', err);
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

  const approve = async (id) => {
    setIsAction(prev => ({ ...prev, [id]: 'approve' }));
    try {
      await api.put(API_PATHS.ADMIN.TESTIMONIALS.APPROVE(id));
      fetchTestimonials();
      fetchTestimonialStats();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to approve testimonial');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  const reject = async (id) => {
    setIsAction(prev => ({ ...prev, [id]: 'reject' }));
    try {
      await api.put(API_PATHS.ADMIN.TESTIMONIALS.REJECT(id));
      fetchTestimonials();
      fetchTestimonialStats();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to reject testimonial');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
  };

  const deleteTestimonial = async (id) => {
    setIsAction(prev => ({ ...prev, [id]: 'delete' }));
    try {
      await api.delete(API_PATHS.ADMIN.TESTIMONIALS.DELETE(id));
      fetchTestimonials();
      fetchTestimonialStats();
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to delete testimonial');
    } finally {
      setIsAction(prev => ({ ...prev, [id]: null }));
    }
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
      case 'Pending': return <AlertCircle className="w-4 h-4" />;
      case 'Rejected': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };


  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Testimonial Management</h1>
            <p className="text-white mt-1">Review and manage customer testimonials</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{testimonials.length} total testimonials</span>
          </div>
        </div>

        {/* Testimonial Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Total</dt>
                  <dd className="text-sm font-medium text-gray-900">{testimonialStats.totalTestimonials}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-sm font-medium text-gray-900">{testimonialStats.pendingTestimonials}</dd>
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
                  <dd className="text-sm font-medium text-gray-900">{testimonialStats.approvedTestimonials}</dd>
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
                  <dd className="text-sm font-medium text-gray-900">{testimonialStats.rejectedTestimonials}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Avg Rating</dt>
                  <dd className="text-sm font-medium text-gray-900">{testimonialStats.averageRating || 'N/A'}</dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 truncate">Rated</dt>
                  <dd className="text-sm font-medium text-gray-900">{testimonialStats.ratedTestimonials}</dd>
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(t.status)}`}>
                    {getStatusIcon(t.status)}
                    {t.status}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-start text-sm">
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{t.message}</p>
                  </div>
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

                <div className="flex justify-between items-center">
                  {t.status === 'Pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approve(t._id)}
                        disabled={isAction[t._id] === 'approve'}
                        className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 h-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => reject(t._id)}
                        disabled={isAction[t._id] === 'reject'}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                      >
                        <XCircle className="w-3 h-3" />
                        Reject
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => deleteTestimonial(t._id)}
                    disabled={isAction[t._id] === 'delete'}
                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(t.status)}`}>
                        {getStatusIcon(t.status)}
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {t.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => approve(t._id)}
                              disabled={isAction[t._id] === 'approve'}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <CheckCircle className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() => reject(t._id)}
                              disabled={isAction[t._id] === 'reject'}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
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
                <p className="text-gray-500">No testimonials have been submitted yet.</p>
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
                  className="max-w-full max-h-full object-contain rounded-lg"
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

export default AdminTestimonials;