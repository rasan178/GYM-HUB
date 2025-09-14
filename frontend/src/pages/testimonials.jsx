import { useEffect, useState } from 'react';
import api from '../utils/axiosInstance';
import MainLayout from '../components/Layouts/MainLayout';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import TextInput from '../components/Inputs/TextInput';
import FileInput from '../components/Inputs/FileInput';
import Modal from '../components/Modal';
import TestimonialCard from '../components/Cards/TestimonialCard';
import { API_PATHS } from '../utils/apiPaths';
import { canEditTestimonial } from '../utils/helpers';
import SpinnerLoader from '../components/Loaders/SpinnerLoader';
import SkeletonLoader from '../components/Loaders/SkeletonLoader';

const Testimonials = () => {
  const { user, error } = useContext(AuthContext);
  const [testimonials, setTestimonials] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ message: '', rating: '', userRole: '', image: null });
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get(API_PATHS.TESTIMONIALS.GET_APPROVED);
      setTestimonials(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const submitTestimonial = async () => {
    setIsSubmitting(true);
    const fd = new FormData();
    fd.append('message', formData.message);
    fd.append('rating', formData.rating);
    fd.append('userRole', formData.userRole);
    if (formData.image) fd.append('image', formData.image);
    try {
      if (formData._id) {
        await api.put(API_PATHS.TESTIMONIALS.UPDATE(formData._id), fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post(API_PATHS.TESTIMONIALS.CREATE, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setIsModalOpen(false);
      setFormData({ message: '', rating: '', userRole: '', image: null });
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
      setLocalError('Cannot edit testimonial after 10 days');
      return;
    }
    setFormData({
      _id: t._id,
      message: t.message,
      rating: t.rating,
      userRole: t.userRole,
      image: null
    });
    setIsModalOpen(true);
  };

  if (isLoading) return <SkeletonLoader />;

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-4">Testimonials</h1>
      {error && <div className="alert alert-error mb-4">{error}</div>}
      {localError && <div className="alert alert-error mb-4">{localError}</div>}
      {user && (
        <button className="btn btn-primary mb-4" onClick={() => { setFormData({ message: '', rating: '', userRole: '', image: null }); setIsModalOpen(true); }}>
          Submit Testimonial
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map(t => (
          <div key={t._id} className="relative">
            <TestimonialCard testimonial={t} />
            {user && t.userID === user._id && canEditTestimonial(t.createdAt) && (
              <button className="btn btn-sm btn-primary absolute top-2 right-2" onClick={() => editTestimonial(t)}>Edit</button>
            )}
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <TextInput label="Message" name="message" value={formData.message} onChange={handleChange} required />
        <TextInput label="Rating (1-5)" name="rating" type="number" value={formData.rating} onChange={handleChange} required />
        <TextInput label="Your Role/Job" name="userRole" value={formData.userRole} onChange={handleChange} required />
        <FileInput label="Image" name="image" onChange={handleChange} />
        <button className="btn btn-primary mt-4" onClick={submitTestimonial} disabled={isSubmitting}>
          {isSubmitting ? <SpinnerLoader /> : 'Submit'}
        </button>
      </Modal>
    </MainLayout>
  );
};

export default Testimonials;