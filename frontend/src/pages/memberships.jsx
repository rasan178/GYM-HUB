import { useState, useEffect, useContext } from 'react';
import Link from 'next/link';
import MainLayout from '../components/Layouts/MainLayout';
import AuthContext from '../context/AuthContext';
import api from '../utils/axiosInstance';
import { API_PATHS } from '../utils/apiPaths';
import { 
  CheckCircle, 
  ArrowRight, 
  Clock, 
  Users, 
  Star,
  DollarSign,
  Calendar,
  Zap
} from 'lucide-react';

export default function Memberships() {
  const { user } = useContext(AuthContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get(API_PATHS.PLANS.GET_ALL);
      console.log('Plans data:', data); // Debug log
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-xl font-bold text-black">Loading memberships...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-black text-white py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-black mb-6 uppercase tracking-wider">
            Choose Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
              {' '}Membership Plan
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
            Find the perfect membership plan that fits your fitness goals and lifestyle.
          </p>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          {plans.length === 0 ? (
            <div className="text-center">
              <div className="bg-black text-white p-12 inline-block border-4 border-black mb-6">
                <Users className="w-24 h-24 mx-auto text-gray-400" />
              </div>
              <p className="text-xl text-gray-600 font-bold">
                No membership plans available at the moment.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <div 
                  key={plan._id} 
                  className={`border-2 border-black p-8 bg-white hover:bg-black hover:text-white transition-all duration-300 group transform hover:-translate-y-2 shadow-lg ${
                    index === 1 ? 'ring-4 ring-black ring-opacity-50 scale-105' : ''
                  }`}
                >
                  {index === 1 && (
                    <div className="bg-black text-white px-4 py-2 text-center font-black uppercase tracking-wide text-sm mb-6 -mt-8 -mx-8">
                      Most Popular
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-black mb-2 uppercase tracking-wide">{plan.planName}</h3>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <DollarSign className="w-6 h-6 text-black group-hover:text-white" />
                      <span className="text-4xl font-black">{plan.price}</span>
                      <span className="text-gray-600 group-hover:text-gray-300 font-bold">/month</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-gray-600 group-hover:text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span className="font-bold">{plan.durationMonths} month(s)</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-gray-600 group-hover:text-gray-300 font-medium text-center text-sm">
                      {plan.description || (plan.benifits ? plan.benifits.split(',').slice(0, 2).join(', ') + '...' : 'Premium fitness membership plan')}
                    </p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.benifits ? plan.benifits.split(',').map((benefit, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-black group-hover:text-white flex-shrink-0" />
                        <span className="font-bold text-sm">{benefit.trim()}</span>
                      </div>
                    )) : (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-black group-hover:text-white flex-shrink-0" />
                        <span className="font-bold text-sm">Premium fitness membership</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <Link href={`/memberships/${plan._id}`}>
                      <button className="w-full bg-black text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-2 border-black group-hover:border-white group-hover:bg-white group-hover:text-black">
                        {user ? 'Request Membership' : 'View Details'}
                        <ArrowRight className="w-4 h-4 inline ml-2" />
                      </button>
                    </Link>
                    {!user && (
                      <Link href="/auth/register">
                        <button className="w-full border-2 border-black group-hover:border-white px-6 py-3 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                          Get Started
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 border-b-4 border-white pb-8">
            <h2 className="text-5xl font-black mb-4 uppercase tracking-wider">Why Choose Our Memberships?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              We provide flexible membership options to fit every fitness journey.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 border-2 border-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="mb-6 flex justify-center">
                <Zap className="w-16 h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Flexible Plans</h3>
              <p className="text-gray-300 group-hover:text-gray-700 font-medium">
                Choose from various membership durations that suit your schedule and goals.
              </p>
            </div>
            <div className="text-center p-8 border-2 border-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="mb-6 flex justify-center">
                <Users className="w-16 h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Expert Support</h3>
              <p className="text-gray-300 group-hover:text-gray-700 font-medium">
                Get guidance from certified trainers and access to personalized programs.
              </p>
            </div>
            <div className="text-center p-8 border-2 border-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="mb-6 flex justify-center">
                <Calendar className="w-16 h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">24/7 Access</h3>
              <p className="text-gray-300 group-hover:text-gray-700 font-medium">
                Work out whenever it's convenient for you with round-the-clock facility access.
              </p>
            </div>
          </div>
        </div>
      </section>

    </MainLayout>
  );
}
