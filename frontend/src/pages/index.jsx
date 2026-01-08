import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '../components/Layouts/MainLayout';
import api from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { 
  Dumbbell, 
  Target, 
  Users, 
  Clock, 
  Award, 
  Heart, 
  Zap, 
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Plus,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';


export default function Home() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [trainersCount, setTrainersCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  // Hero background images
  const heroImages = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  ];

  const [testimonialForm, setTestimonialForm] = useState({
    message: '',
    rating: 5,
    userRole: '',
    image: null
  });

  useEffect(() => {
    fetchTestimonials();
    fetchStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const fetchStats = async () => {
    try {
      console.log('Fetching stats...');
      
      // Fetch users count
      try {
        const usersResponse = await api.get(API_PATHS.USERS.GET_COUNT);
        console.log('Users response:', usersResponse);
        console.log('Users data:', usersResponse.data);
        
        if (usersResponse.data && usersResponse.data.count !== undefined) {
          console.log('Setting users count to:', usersResponse.data.count);
          setUsersCount(usersResponse.data.count);
        }
      } catch (userError) {
        console.error('Error fetching users count:', userError.response?.data || userError.message);
      }

      // Fetch trainers
      try {
        const trainersResponse = await api.get(API_PATHS.TRAINERS.GET_ALL);
        console.log('Trainers response:', trainersResponse);
        console.log('Trainers data:', trainersResponse.data);
        
        if (trainersResponse.data) {
          const count = Array.isArray(trainersResponse.data) 
            ? trainersResponse.data.length 
            : (trainersResponse.data.count || 0);
          console.log('Setting trainers count to:', count);
          setTrainersCount(count);
        }
      } catch (trainerError) {
        console.error('Error fetching trainers:', trainerError.response?.data || trainerError.message);
      }

      // Fetch classes count
      try {
        const classesResponse = await api.get(API_PATHS.CLASSES.GET_COUNT);
        console.log('Classes response:', classesResponse);
        console.log('Classes data:', classesResponse.data);
        
        if (classesResponse.data && classesResponse.data.count !== undefined) {
          console.log('Setting classes count to:', classesResponse.data.count);
          setClassesCount(classesResponse.data.count);
        }
      } catch (classError) {
        console.error('Error fetching classes count:', classError.response?.data || classError.message);
      }
    } catch (error) {
      console.error('Error in fetchStats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const { data } = await api.get(API_PATHS.TESTIMONIALS.GET_APPROVED);
      setTestimonials(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTestimonial = async (e) => {
    e.preventDefault();
    setCreateLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('message', testimonialForm.message);
      formData.append('rating', testimonialForm.rating);
      formData.append('userRole', testimonialForm.userRole);
      
      if (testimonialForm.image) {
        formData.append('image', testimonialForm.image);
      }

      await api.post(
        API_PATHS.TESTIMONIALS.CREATE,
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Testimonial submitted successfully! It will be reviewed before appearing.');
      setShowCreateForm(false);
      setTestimonialForm({ message: '', rating: 5, userRole: '', image: null });
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Error creating testimonial:', error);
      toast.error('Failed to submit testimonial');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <MainLayout>
      {/* Enhanced Hero Section */}
      <section className="relative bg-black text-white overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center pt-16">
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${image}')`,
                backgroundPosition: 'center center',
                backgroundAttachment: 'fixed'
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80" />
        </div>

        {/* Enhanced Image Indicators */}
        <div className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 sm:w-4 sm:h-4 border-2 border-white transition-all duration-300 rounded-full ${
                index === currentImageIndex ? 'bg-white scale-125' : 'bg-transparent hover:bg-white/50'
              }`}
            />
          ))}
        </div>
        
        <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 text-center">
          {/* Enhanced Branding */}
          <div className="inline-flex items-center justify-center bg-white text-black px-4 sm:px-6 py-2 sm:py-3 font-black text-lg sm:text-xl mb-6 sm:mb-8 rounded-lg shadow-lg">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center mr-2 sm:mr-3 font-bold text-sm sm:text-base">
              G
            </div>
            GYM-HUB
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-4 sm:mb-6 uppercase tracking-wider drop-shadow-2xl leading-tight">
            Transform Your Body,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              Elevate Your Life
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-3xl mx-auto text-gray-200 font-medium px-4 leading-relaxed">
            Join GYM-HUB, the ultimate fitness destination with modern equipment,
            expert trainers, and a community dedicated to your success.
          </p>

          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4 mb-8 sm:mb-12">
            <Link href="/auth/register">
              <button className="w-full sm:w-auto bg-white text-black px-8 sm:px-10 py-4 sm:py-5 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white transform hover:scale-105 shadow-2xl hover:shadow-3xl text-sm sm:text-base lg:text-lg rounded-lg">
                Start Your Journey
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </Link>
            <Link href="/trainers">
              <button className="w-full sm:w-auto border-2 border-white text-white px-8 sm:px-10 py-4 sm:py-5 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 text-sm sm:text-base lg:text-lg rounded-lg shadow-lg hover:shadow-xl">
                Meet Our Trainers
              </button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-2xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                {statsLoading ? '...' : usersCount}+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Members
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                {statsLoading ? '...' : trainersCount}+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Trainers
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                {statsLoading ? '...' : classesCount}+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Classes
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/20">
              <div className="text-2xl sm:text-3xl font-black text-white mb-1">
                24/7
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Access
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-16 bg-white border-b-2 sm:border-b-4 border-black">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <div className="text-center p-3 sm:p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-300 group shadow-lg">
              <Users className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-black group-hover:text-white transition-colors" />
              <div className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2">
                {statsLoading ? '...' : usersCount.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-600 group-hover:text-white">
                Happy Members
              </div>
            </div>
            <div className="text-center p-3 sm:p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-300 group shadow-lg">
              <Award className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-black group-hover:text-white transition-colors" />
              <div className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2">
                {statsLoading ? '...' : trainersCount}
              </div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-600 group-hover:text-white">
                Expert Trainers
              </div>
            </div>
            <div className="text-center p-3 sm:p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-300 group shadow-lg">
              <Dumbbell className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-black group-hover:text-white transition-colors" />
              <div className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2">100+</div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-600 group-hover:text-white">
                Modern Equipment
              </div>
            </div>
            <div className="text-center p-3 sm:p-6 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-300 group shadow-lg">
              <Clock className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-4 text-black group-hover:text-white transition-colors" />
              <div className="text-2xl sm:text-4xl font-black mb-1 sm:mb-2">24/7</div>
              <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-gray-600 group-hover:text-white">
                Access Hours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8 sm:mb-16 border-b-2 sm:border-b-4 border-white pb-6 sm:pb-8">
            <h2 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 uppercase tracking-wider">Why Choose GYM-HUB?</h2>
            <p className="text-sm sm:text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              We provide everything you need to achieve your fitness goals in a modern, 
              supportive environment.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-8 border-2 border-white bg-transparent hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 uppercase tracking-wide">Modern Equipment</h3>
              <p className="text-sm sm:text-base text-gray-300 group-hover:text-gray-700 font-medium">
                State-of-the-art gym equipment for all your fitness needs
              </p>
            </div>
            <div className="text-center p-4 sm:p-8 border-2 border-white bg-transparent hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <Users className="w-12 h-12 sm:w-16 sm:h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 uppercase tracking-wide">Expert Trainers</h3>
              <p className="text-sm sm:text-base text-gray-300 group-hover:text-gray-700 font-medium">
                Certified personal trainers to guide your fitness journey
              </p>
            </div>
            <div className="text-center p-4 sm:p-8 border-2 border-white bg-transparent hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <Target className="w-12 h-12 sm:w-16 sm:h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 uppercase tracking-wide">Custom Programs</h3>
              <p className="text-sm sm:text-base text-gray-300 group-hover:text-gray-700 font-medium">
                Personalized workout plans tailored to your goals
              </p>
            </div>
            <div className="text-center p-4 sm:p-8 border-2 border-white bg-transparent hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 group">
              <div className="mb-4 sm:mb-6 flex justify-center">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-lg sm:text-xl font-black mb-3 sm:mb-4 uppercase tracking-wide">Health Focused</h3>
              <p className="text-sm sm:text-base text-gray-300 group-hover:text-gray-700 font-medium">
                Comprehensive health and wellness programs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 border-b-4 border-black pb-8">
            <h2 className="text-5xl font-black text-black mb-4 uppercase tracking-wider">Our Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
              Discover our comprehensive fitness programs designed to help you reach your goals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-2 border-black p-8 bg-white hover:bg-black hover:text-white transition-all duration-300 group transform hover:-translate-y-2 shadow-lg">
              <div className="mb-6">
                <Zap className="w-12 h-12 text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Strength Training</h3>
              <p className="text-gray-600 group-hover:text-gray-300 mb-6 font-medium">
                Build muscle and increase power with our strength programs
              </p>
              <Link href="/classes">
                <button className="flex items-center gap-2 font-black uppercase tracking-wide text-sm border-2 border-black group-hover:border-white px-4 py-2 hover:bg-white hover:text-black transition-all">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="border-2 border-black p-8 bg-white hover:bg-black hover:text-white transition-all duration-300 group transform hover:-translate-y-2 shadow-lg">
              <div className="mb-6">
                <Target className="w-12 h-12 text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Cardio Fitness</h3>
              <p className="text-gray-600 group-hover:text-gray-300 mb-6 font-medium">
                Improve cardiovascular health with varied cardio workouts
              </p>
              <Link href="/classes">
                <button className="flex items-center gap-2 font-black uppercase tracking-wide text-sm border-2 border-black group-hover:border-white px-4 py-2 hover:bg-white hover:text-black transition-all">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="border-2 border-black p-8 bg-white hover:bg-black hover:text-white transition-all duration-300 group transform hover:-translate-y-2 shadow-lg">
              <div className="mb-6">
                <Award className="w-12 h-12 text-black group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Group Classes</h3>
              <p className="text-gray-600 group-hover:text-gray-300 mb-6 font-medium">
                Join energizing group fitness classes for motivation
              </p>
              <Link href="/classes">
                <button className="flex items-center gap-2 font-black uppercase tracking-wide text-sm border-2 border-black group-hover:border-white px-4 py-2 hover:bg-white hover:text-black transition-all">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 border-b-4 border-white pb-8">
            <div className="flex justify-center items-center gap-4 mb-4">
              <h2 className="text-5xl font-black uppercase tracking-wider">What Our Members Say</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-white text-black p-3 border-2 border-white hover:bg-gray-200 transition-all duration-300 transform hover:scale-110"
                title="Add Testimonial"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              Real stories from real people who transformed their lives at GYM-HUB.
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-300 font-bold text-xl">Loading testimonials...</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center">
              <div className="bg-white text-black p-12 inline-block border-4 border-white mb-6">
                <Star className="w-24 h-24 mx-auto text-gray-400" />
              </div>
              <p className="text-xl text-gray-300 font-bold">
                No testimonials yet. Be the first to share your experience!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 6).map((testimonial) => (
                <div key={testimonial._id} className="bg-white text-black p-8 border-2 border-white hover:transform hover:-translate-y-2 transition-all duration-300 shadow-lg">
                  {testimonial.imageURL && (
                    <img 
                      src={testimonial.imageURL} 
                      alt={testimonial.userName}
                      className="w-20 h-20 border-4 border-black mx-auto mb-4 object-cover rounded-full"
                    />
                  )}
                  <div className="flex mb-4 justify-center">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-800 mb-6 italic font-medium">"{testimonial.message}"</p>
                  <div className="border-t-2 border-black pt-4 text-center">
                    <div className="font-black uppercase tracking-wide">{testimonial.userName}</div>
                    <div className="text-gray-600 font-bold text-sm">{testimonial.userRole}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Testimonial Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white text-black p-8 border-4 border-black max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-start mb-6 pb-6 border-b-4 border-black">
                <h3 className="text-3xl font-black uppercase tracking-wider">Share Your Experience</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-black hover:bg-black hover:text-white p-2 border-2 border-black transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateTestimonial}>
                <div className="mb-4">
                  <label className="block text-sm font-black mb-2 uppercase tracking-wide">Your Role/Job</label>
                  <input
                    type="text"
                    value={testimonialForm.userRole}
                    onChange={(e) => setTestimonialForm({...testimonialForm, userRole: e.target.value})}
                    className="w-full border-2 border-black px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
                    placeholder="e.g., Fitness Enthusiast"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-black mb-2 uppercase tracking-wide">Your Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTestimonialForm({...testimonialForm, image: e.target.files[0]})}
                    className="w-full border-2 border-black px-4 py-3 font-medium"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-black mb-2 uppercase tracking-wide">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 cursor-pointer transition-all ${star <= testimonialForm.rating ? 'fill-current text-black' : 'text-gray-300'}`}
                        onClick={() => setTestimonialForm({...testimonialForm, rating: star})}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-black mb-2 uppercase tracking-wide">Your Message</label>
                  <textarea
                    value={testimonialForm.message}
                    onChange={(e) => setTestimonialForm({...testimonialForm, message: e.target.value})}
                    className="w-full border-2 border-black px-4 py-3 h-32 font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
                    placeholder="Share your experience with GYM-HUB..."
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="bg-black text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-gray-800 transition-all border-2 border-black disabled:opacity-50 flex-1"
                  >
                    {createLoading ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="border-2 border-black px-6 py-3 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* Membership CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-5xl font-black text-black mb-4 uppercase tracking-wider">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto font-medium">
            Join thousands of members who have already transformed their lives. 
            Your fitness journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <button className="border-2 border-black bg-black text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 shadow-lg">
                Join Now
              </button>
            </Link>
            <Link href="/classes">
              <button className="border-2 border-black text-black px-8 py-4 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105">
                Browse Classes
              </button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 p-4 border-2 border-black hover:bg-black hover:text-white transition-all group shadow-lg">
              <Phone className="w-5 h-5" />
              <span className="font-bold">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 border-2 border-black hover:bg-black hover:text-white transition-all group shadow-lg">
              <Mail className="w-5 h-5" />
              <span className="font-bold">info@gymhub.com</span>
            </div>
            <div className="flex items-center justify-center gap-3 p-4 border-2 border-black hover:bg-black hover:text-white transition-all group shadow-lg">
              <MapPin className="w-5 h-5" />
              <span className="font-bold">123 Fitness Street</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl font-black mb-8 uppercase tracking-wider border-b-4 border-white pb-6">Membership Benefits</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 border-2 border-white hover:bg-white hover:text-black transition-all group">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 text-white group-hover:text-black transition-colors" />
                  <span className="font-bold">Unlimited access to all equipment</span>
                </div>
                <div className="flex items-center gap-4 p-4 border-2 border-white hover:bg-white hover:text-black transition-all group">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 text-white group-hover:text-black transition-colors" />
                  <span className="font-bold">Free personal training consultation</span>
                </div>
                <div className="flex items-center gap-4 p-4 border-2 border-white hover:bg-white hover:text-black transition-all group">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 text-white group-hover:text-black transition-colors" />
                  <span className="font-bold">Access to group fitness classes</span>
                </div>
                <div className="flex items-center gap-4 p-4 border-2 border-white hover:bg-white hover:text-black transition-all group">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 text-white group-hover:text-black transition-colors" />
                  <span className="font-bold">Locker room and shower facilities</span>
                </div>
                <div className="flex items-center gap-4 p-4 border-2 border-white hover:bg-white hover:text-black transition-all group">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 text-white group-hover:text-black transition-colors" />
                  <span className="font-bold">Nutritional guidance and meal plans</span>
                </div>
                <div className="flex items-center gap-4 p-4 border-2 border-white hover:bg-white hover:text-black transition-all group">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 text-white group-hover:text-black transition-colors" />
                  <span className="font-bold">Member-only events and challenges</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white text-black p-12 border-4 border-white inline-block transform hover:scale-105 transition-all duration-300 shadow-2xl">
                <h3 className="text-3xl font-black mb-6 uppercase tracking-widest">Premium Membership</h3>
                <div className="text-6xl font-black mb-2">$49</div>
                <div className="text-gray-600 mb-8 font-bold uppercase tracking-wide">per month</div>
                <div className="space-y-3">
                  <Link href="/memberships">
                    <button className="bg-black text-white px-8 py-4 font-black uppercase tracking-widest w-full hover:bg-gray-800 transition-all border-2 border-black">
                      View All Plans
                    </button>
                  </Link>
                  <Link href="/auth/register">
                    <button className="border-2 border-black text-black px-8 py-4 font-black uppercase tracking-widest w-full hover:bg-black hover:text-white transition-all">
                      Get Started
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}