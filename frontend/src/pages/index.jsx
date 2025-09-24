import { useState, useEffect } from 'react';
import Link from 'next/link';
import MainLayout from '../components/Layouts/MainLayout';
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
  Plus
} from 'lucide-react';

const apiPaths = {
  GET_APPROVED: "http://localhost:8000/api/testimonials",
  CREATE: "http://localhost:8000/api/testimonials"
};

export default function Home() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Hero background images - 5 high-quality gym/fitness images
  const heroImages = [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  ];

  // Form state for creating testimonials
  const [testimonialForm, setTestimonialForm] = useState({
    message: '',
    rating: 5,
    userRole: '',
    image: null
  });

  // Fetch testimonials on component mount
  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Auto-change hero background image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const fetchTestimonials = async () => {
    try {
      console.log('Fetching testimonials from:', apiPaths.GET_APPROVED);
      const response = await fetch(apiPaths.GET_APPROVED);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Testimonials data:', data);
        setTestimonials(data);
      } else {
        console.error('Failed to fetch testimonials:', response.status);
      }
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
      const token = localStorage.getItem('token'); // Adjust based on your auth implementation
      
      // Create FormData to handle file upload
      const formData = new FormData();
      formData.append('message', testimonialForm.message);
      formData.append('rating', testimonialForm.rating);
      formData.append('userRole', testimonialForm.userRole);
      
      if (testimonialForm.image) {
        formData.append('image', testimonialForm.image);
      }

      console.log('Submitting testimonial to:', apiPaths.CREATE);
      
      const response = await fetch(apiPaths.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - browser will set it automatically
        },
        body: formData
      });

      console.log('Create response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Testimonial created:', result);
        alert('Testimonial submitted successfully! It will be reviewed before appearing.');
        setShowCreateForm(false);
        setTestimonialForm({ message: '', rating: 5, userRole: '', image: null });
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      } else {
        const error = await response.json();
        console.error('Create error:', error);
        alert(error.message || 'Failed to submit testimonial');
      }
    } catch (error) {
      console.error('Error creating testimonial:', error);
      alert('Failed to submit testimonial');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${i < rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <MainLayout>
      {/* Hero Section - Start at top with no margin/padding */}
      <section className="relative bg-black text-white overflow-hidden h-[400px] md:h-[550px] flex items-center pt-16">
        {/* Background Image Carousel */}
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
          {/* Blur overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-black/60" />
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
          {heroImages.map((_, index) => (
            <div
              key={index}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-white/3 rounded-full blur-2xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/4 rounded-full blur-lg animate-pulse delay-500" />
        </div>
        
        {/* Content */}
        <div className="relative z-20 w-full max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-2xl">
            Transform Your Body,<br />
            <span className="text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Elevate Your Life
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-200 drop-shadow-lg">
            Join GYM-HUB, the ultimate fitness destination with modern equipment, 
            expert trainers, and a community dedicated to your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <button className="bg-white text-black px-6 md:px-8 py-3 md:py-4 font-semibold hover:bg-gray-100 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl backdrop-blur-sm rounded-lg">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/trainers">
              <button className="border-2 border-white text-white px-6 md:px-8 py-3 md:py-4 font-semibold hover:bg-white hover:text-black hover:scale-105 transition-all duration-300 backdrop-blur-sm bg-white/10 rounded-lg">
                Meet Our Trainers
              </button>
            </Link>
          </div>
        </div>
        
        {/* Bottom fade effect */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent z-10" />
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="border-l-4 border-black pl-4">
              <div className="text-4xl font-bold text-black mb-2">5000+</div>
              <div className="text-gray-600">Happy Members</div>
            </div>
            <div className="border-l-4 border-black pl-4">
              <div className="text-4xl font-bold text-black mb-2">50+</div>
              <div className="text-gray-600">Expert Trainers</div>
            </div>
            <div className="border-l-4 border-black pl-4">
              <div className="text-4xl font-bold text-black mb-2">100+</div>
              <div className="text-gray-600">Modern Equipment</div>
            </div>
            <div className="border-l-4 border-black pl-4">
              <div className="text-4xl font-bold text-black mb-2">24/7</div>
              <div className="text-gray-600">Access Hours</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose GYM-HUB?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We provide everything you need to achieve your fitness goals in a modern, 
              supportive environment.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group hover:transform hover:scale-105 transition-transform">
              <div className="mb-6 flex justify-center text-white group-hover:text-gray-300 transition-colors">
                <Dumbbell className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold mb-4">Modern Equipment</h3>
              <p className="text-gray-300">State-of-the-art gym equipment for all your fitness needs</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-transform">
              <div className="mb-6 flex justify-center text-white group-hover:text-gray-300 transition-colors">
                <Users className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold mb-4">Expert Trainers</h3>
              <p className="text-gray-300">Certified personal trainers to guide your fitness journey</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-transform">
              <div className="mb-6 flex justify-center text-white group-hover:text-gray-300 transition-colors">
                <Clock className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold mb-4">24/7 Access</h3>
              <p className="text-gray-300">Train whenever you want with round-the-clock access</p>
            </div>
            <div className="text-center group hover:transform hover:scale-105 transition-transform">
              <div className="mb-6 flex justify-center text-white group-hover:text-gray-300 transition-colors">
                <Heart className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold mb-4">Health Focused</h3>
              <p className="text-gray-300">Comprehensive health and wellness programs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-black mb-4">Our Programs</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our comprehensive fitness programs designed to help you reach your goals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-colors group">
              <div className="mb-6 text-black group-hover:text-white">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Strength Training</h3>
              <p className="text-gray-600 group-hover:text-gray-300 mb-6">Build muscle and increase power with our strength programs</p>
              <Link href="/classes">
                <button className="flex items-center gap-2 font-semibold text-black group-hover:text-white">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-colors group">
              <div className="mb-6 text-black group-hover:text-white">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Cardio Fitness</h3>
              <p className="text-gray-600 group-hover:text-gray-300 mb-6">Improve cardiovascular health with varied cardio workouts</p>
              <Link href="/classes">
                <button className="flex items-center gap-2 font-semibold text-black group-hover:text-white">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-colors group">
              <div className="mb-6 text-black group-hover:text-white">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Group Classes</h3>
              <p className="text-gray-600 group-hover:text-gray-300 mb-6">Join energizing group fitness classes for motivation</p>
              <Link href="/classes">
                <button className="flex items-center gap-2 font-semibold text-black group-hover:text-white">
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
          <div className="text-center mb-16">
            <div className="flex justify-center items-center gap-4 mb-4">
              <h2 className="text-4xl font-bold">What Our Members Say</h2>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-white text-black p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Add Testimonial"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real stories from real people who transformed their lives at GYM-HUB.
            </p>
          </div>

          {loading ? (
            <div className="text-center text-gray-300">Loading testimonials...</div>
          ) : testimonials.length === 0 ? (
            <div className="text-center text-gray-300">No testimonials yet. Be the first to share your experience!</div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.slice(0, 6).map((testimonial) => (
                <div key={testimonial._id} className="bg-white text-black p-8">
                  {testimonial.imageURL && (
                    <img 
                      src={testimonial.imageURL} 
                      alt={testimonial.userName}
                      className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
                    />
                  )}
                  <div className="flex mb-4 justify-center">
                    {renderStars(testimonial.rating)}
                  </div>
                  <p className="text-gray-800 mb-6 italic">"{testimonial.message}"</p>
                  <div className="border-t border-gray-200 pt-4 text-center">
                    <div className="font-bold">{testimonial.userName}</div>
                    <div className="text-gray-600">{testimonial.userRole}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Testimonial Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white text-black p-8 rounded-lg max-w-md w-full mx-4">
              <h3 className="text-2xl font-bold mb-6">Share Your Experience</h3>
              <form onSubmit={handleCreateTestimonial}>
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Your Role/Job</label>
                  <input
                    type="text"
                    value={testimonialForm.userRole}
                    onChange={(e) => setTestimonialForm({...testimonialForm, userRole: e.target.value})}
                    className="w-full border border-gray-300 px-3 py-2 rounded"
                    placeholder="e.g., Fitness Enthusiast, Professional Athlete"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Your Photo (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setTestimonialForm({...testimonialForm, image: e.target.files[0]})}
                    className="w-full border border-gray-300 px-3 py-2 rounded"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-bold mb-2">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-6 h-6 cursor-pointer ${star <= testimonialForm.rating ? 'fill-current text-yellow-500' : 'text-gray-300'}`}
                        onClick={() => setTestimonialForm({...testimonialForm, rating: star})}
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-2">Your Message</label>
                  <textarea
                    value={testimonialForm.message}
                    onChange={(e) => setTestimonialForm({...testimonialForm, message: e.target.value})}
                    className="w-full border border-gray-300 px-3 py-2 rounded h-24"
                    placeholder="Share your experience with GYM-HUB..."
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {createLoading ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="border border-black px-6 py-2 rounded hover:bg-gray-100 transition-colors"
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
          <h2 className="text-4xl font-bold text-black mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have already transformed their lives. 
            Your fitness journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/auth/register">
              <button className="border-2 border-black bg-black text-white px-8 py-4 font-semibold hover:bg-white hover:text-black transition-colors">
                Join Now
              </button>
            </Link>
            <Link href="/classes">
              <button className="border-2 border-black text-black px-8 py-4 font-semibold hover:bg-black hover:text-white transition-colors">
                Browse Classes
              </button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 text-gray-600">
              <Phone className="w-5 h-5" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600">
              <Mail className="w-5 h-5" />
              <span>info@gymhub.com</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5" />
              <span>123 Fitness Street</span>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">Membership Benefits</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                  <span>Unlimited access to all equipment</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                  <span>Free personal training consultation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                  <span>Access to group fitness classes</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                  <span>Locker room and shower facilities</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                  <span>Nutritional guidance and meal plans</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-white" />
                  <span>Member-only events and challenges</span>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white text-black p-8 inline-block">
                <h3 className="text-2xl font-bold mb-4">Premium Membership</h3>
                <div className="text-4xl font-bold mb-2">$49</div>
                <div className="text-gray-600 mb-6">per month</div>
                <Link href="/auth/register">
                  <button className="bg-black text-white px-8 py-3 font-semibold w-full hover:bg-gray-800 transition-colors">
                    Get Started
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}