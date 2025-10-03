import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import MainLayout from '../../components/Layouts/MainLayout';
import AuthContext from '../../context/AuthContext';
import api from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { 
  CheckCircle, 
  ArrowLeft, 
  Clock, 
  DollarSign,
  Calendar,
  Star,
  Users,
  Zap,
  Shield,
  Heart,
  Send,
  X
} from 'lucide-react';

export default function MembershipDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useContext(AuthContext);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestData, setRequestData] = useState({
    requestedStartDate: '',
    message: ''
  });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestSuccess, setRequestSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlan();
    }
  }, [id]);

  const fetchPlan = async () => {
    try {
      const { data } = await api.get(API_PATHS.PLANS.GET_ONE(id));
      setPlan(data);
      // Set default start date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setRequestData(prev => ({
        ...prev,
        requestedStartDate: tomorrow.toISOString().split('T')[0]
      }));
    } catch (error) {
      console.error('Error fetching plan:', error);
      setError('Failed to load membership details');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMembership = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestError(null);

    try {
      await api.post(API_PATHS.MEMBERSHIP_REQUESTS.CREATE, {
        planID: id,
        requestedStartDate: requestData.requestedStartDate,
        message: requestData.message
      });

      setRequestSuccess(true);
      setShowRequestModal(false);
      setRequestData({ requestedStartDate: '', message: '' });
    } catch (error) {
      setRequestError(error.response?.data?.message || 'Failed to submit membership request');
    } finally {
      setRequestLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-xl font-bold text-black">Loading membership details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !plan) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="bg-black text-white p-12 inline-block border-4 border-black mb-6">
              <Users className="w-24 h-24 mx-auto text-gray-400" />
            </div>
            <p className="text-xl text-gray-600 font-bold mb-6">
              {error || 'Membership plan not found'}
            </p>
            <Link href="/memberships">
              <button className="bg-black text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-gray-800 transition-all border-2 border-black">
                Back to Memberships
              </button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative bg-black text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/memberships" className="inline-flex items-center gap-2 text-white hover:text-gray-300 transition-colors mb-8">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Back to Memberships</span>
          </Link>
          
          <div className="text-center">
            <h1 className="text-5xl font-black mb-6 uppercase tracking-wider">
              {plan.planName}
            </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium mb-8">
                  {plan.description || (plan.benifits ? plan.benifits.split(',').slice(0, 2).join(', ') + '...' : 'Premium fitness membership plan')}
                </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                <span className="text-4xl font-black">{plan.price}</span>
                <span className="text-gray-300 font-bold">/month</span>
              </div>
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-5 h-5" />
                <span className="font-bold">{plan.durationMonths} month(s)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Details Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Plan Features */}
            <div>
              <h2 className="text-4xl font-black text-black mb-8 uppercase tracking-wider border-b-4 border-black pb-4">
                Plan Details
              </h2>
               <div className="space-y-4">
                 <h3 className="text-xl font-black text-black uppercase tracking-wide">
                   Plan Benefits
                 </h3>
                    <div className="space-y-3">
                      {plan.benifits ? plan.benifits.split(',').map((benefit, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 border-2 border-black hover:bg-black hover:text-white transition-all group">
                          <CheckCircle className="w-6 h-6 flex-shrink-0 text-black group-hover:text-white transition-colors" />
                          <span className="font-bold">{benefit.trim()}</span>
                        </div>
                      )) : (
                        <div className="flex items-center gap-4 p-4 border-2 border-black hover:bg-black hover:text-white transition-all group">
                          <CheckCircle className="w-6 h-6 flex-shrink-0 text-black group-hover:text-white transition-colors" />
                          <span className="font-bold">No benefits listed for this plan</span>
                        </div>
                      )}
                    </div>
               </div>
            </div>

            {/* Plan Summary Card */}
            <div className="bg-black text-white p-8 border-4 border-black shadow-2xl">
              <h3 className="text-3xl font-black mb-6 uppercase tracking-widest text-center">
                {plan.planName}
              </h3>
              
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <DollarSign className="w-8 h-8" />
                  <span className="text-6xl font-black">{plan.price}</span>
                  <span className="text-gray-300 font-bold text-xl">/month</span>
                </div>
                 <div className="flex items-center justify-center gap-2 text-gray-300 mb-6">
                   <Calendar className="w-5 h-5" />
                   <span className="font-bold text-lg">{plan.durationMonths} month(s) duration</span>
                 </div>
                    <p className="text-gray-300 font-medium">
                      {plan.description || (plan.benifits ? plan.benifits.split(',').slice(0, 2).join(', ') + '...' : 'Premium fitness membership plan')}
                    </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold">Best value for money</span>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="font-bold">Cancel anytime</span>
                </div>
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="font-bold">Health & wellness focus</span>
                </div>
              </div>

              <div className="space-y-3">
                {user ? (
                  <button 
                    onClick={() => setShowRequestModal(true)}
                    className="w-full bg-white text-black px-6 py-4 font-black uppercase tracking-widest hover:bg-gray-200 transition-all border-2 border-white flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Request Membership
                  </button>
                ) : (
                  <Link href="/auth/register">
                    <button className="w-full bg-white text-black px-6 py-4 font-black uppercase tracking-widest hover:bg-gray-200 transition-all border-2 border-white">
                      Get Started Now
                    </button>
                  </Link>
                )}
                <Link href="/classes">
                  <button className="w-full border-2 border-white text-white px-6 py-4 font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Browse Classes
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 border-b-4 border-white pb-8">
            <h2 className="text-5xl font-black mb-4 uppercase tracking-wider">Why Choose This Plan?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto font-medium">
              This membership plan is designed to give you the best fitness experience.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 border-2 border-white hover:bg-white hover:text-black transition-all duration-300 group">
              <div className="mb-6 flex justify-center">
                <Zap className="w-16 h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Flexible Access</h3>
              <p className="text-gray-300 group-hover:text-gray-700 font-medium">
                Work out whenever it's convenient for you with 24/7 facility access.
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
                <Heart className="w-16 h-16 text-white group-hover:text-black transition-colors" />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-wide">Health Focus</h3>
              <p className="text-gray-300 group-hover:text-gray-700 font-medium">
                Comprehensive health and wellness programs to support your goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Message */}
      {requestSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black p-8 border-4 border-black max-w-md w-full shadow-2xl text-center">
            <div className="bg-green-500 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-wider">Request Submitted!</h3>
            <p className="text-gray-700 font-medium mb-6">
              Your membership request has been submitted successfully. Our admin team will review it and get back to you soon.
            </p>
            <button
              onClick={() => setRequestSuccess(false)}
              className="bg-black text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-gray-800 transition-all border-2 border-black"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Membership Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black p-8 border-4 border-black max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6 pb-6 border-b-4 border-black">
              <h3 className="text-3xl font-black uppercase tracking-wider">Request Membership</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-black hover:bg-black hover:text-white p-2 border-2 border-black transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleRequestMembership}>
              <div className="mb-6">
                <h4 className="text-xl font-black mb-4 uppercase tracking-wide">{plan?.planName}</h4>
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-2xl font-black">{plan?.price}</span>
                  <span className="text-gray-600 font-bold">/month</span>
                </div>
                    <p className="text-gray-600 font-medium text-sm">
                      {plan?.description || (plan?.benifits ? plan.benifits.split(',').slice(0, 2).join(', ') + '...' : 'Premium fitness membership plan')}
                    </p>
              </div>

              {requestError && (
                <div className="bg-red-50 border-2 border-red-500 text-red-800 px-4 py-3 mb-4 font-bold text-sm">
                  {requestError}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-black mb-2 uppercase tracking-wide">
                  Preferred Start Date
                </label>
                <input
                  type="date"
                  value={requestData.requestedStartDate}
                  onChange={(e) => setRequestData({...requestData, requestedStartDate: e.target.value})}
                  className="w-full border-2 border-black px-4 py-3 font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-black mb-2 uppercase tracking-wide">
                  Message (Optional)
                </label>
                <textarea
                  value={requestData.message}
                  onChange={(e) => setRequestData({...requestData, message: e.target.value})}
                  className="w-full border-2 border-black px-4 py-3 h-24 font-medium focus:outline-none focus:ring-4 focus:ring-black/20"
                  placeholder="Any specific requirements or questions..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={requestLoading}
                  className="bg-black text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-gray-800 transition-all border-2 border-black disabled:opacity-50 flex-1 flex items-center justify-center gap-2"
                >
                  {requestLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Request
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="border-2 border-black px-6 py-3 font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}