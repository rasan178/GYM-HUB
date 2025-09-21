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
  MapPin
} from 'lucide-react';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-black text-white py-20 -mx-4 -mt-4">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">
            Transform Your Body,<br />
            <span className="text-white">Elevate Your Life</span>
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Join GYM-HUB, the ultimate fitness destination with modern equipment, 
            expert trainers, and a community dedicated to your success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-black px-8 py-4 font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
              Start Your Journey
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-white text-white px-8 py-4 font-semibold hover:bg-white hover:text-black transition-colors">
              Take a Tour
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
        <div className="container mx-auto px-4">
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
              <button className="flex items-center gap-2 font-semibold text-black group-hover:text-white">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-colors group">
              <div className="mb-6 text-black group-hover:text-white">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Cardio Fitness</h3>
              <p className="text-gray-600 group-hover:text-gray-300 mb-6">Improve cardiovascular health with varied cardio workouts</p>
              <button className="flex items-center gap-2 font-semibold text-black group-hover:text-white">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="border-2 border-black p-8 hover:bg-black hover:text-white transition-colors group">
              <div className="mb-6 text-black group-hover:text-white">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Group Classes</h3>
              <p className="text-gray-600 group-hover:text-gray-300 mb-6">Join energizing group fitness classes for motivation</p>
              <button className="flex items-center gap-2 font-semibold text-black group-hover:text-white">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">What Our Members Say</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Real stories from real people who transformed their lives at GYM-HUB.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white text-black p-8">
              <div className="flex mb-4">
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
              </div>
              <p className="text-gray-800 mb-6 italic">"GYM-HUB transformed my fitness journey. The trainers are amazing and the equipment is top-notch!"</p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-bold">Sarah Johnson</div>
                <div className="text-gray-600">Fitness Enthusiast</div>
              </div>
            </div>
            <div className="bg-white text-black p-8">
              <div className="flex mb-4">
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
              </div>
              <p className="text-gray-800 mb-6 italic">"The 24/7 access and modern facilities make this gym perfect for my training schedule."</p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-bold">Mike Chen</div>
                <div className="text-gray-600">Professional Athlete</div>
              </div>
            </div>
            <div className="bg-white text-black p-8">
              <div className="flex mb-4">
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
                <Star className="w-5 h-5 fill-current text-yellow-500" />
              </div>
              <p className="text-gray-800 mb-6 italic">"Finally found a gym that fits my lifestyle. Clean, modern, and always available when I need it."</p>
              <div className="border-t border-gray-200 pt-4">
                <div className="font-bold">Emily Davis</div>
                <div className="text-gray-600">Busy Professional</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Membership CTA Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-black mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of members who have already transformed their lives. 
            Your fitness journey starts here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-black text-white px-8 py-4 font-semibold hover:bg-gray-800 transition-colors">
              Join Now
            </button>
            <button className="border-2 border-black text-black px-8 py-4 font-semibold hover:bg-black hover:text-white transition-colors">
              Schedule a Tour
            </button>
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
        <div className="container mx-auto px-4">
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
                <button className="bg-black text-white px-8 py-3 font-semibold w-full hover:bg-gray-800 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}