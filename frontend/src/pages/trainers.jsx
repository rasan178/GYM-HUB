import { useEffect, useState } from 'react';
import { Search, Filter, Users, X, User, Mail, Award, Phone, MapPin, Facebook, Instagram, FileText, Briefcase } from 'lucide-react';
import api from '../utils/axiosInstance';
import MainLayout from '../components/Layouts/MainLayout';
import TrainerCard from '../components/Cards/TrainerCard';
import { API_PATHS } from '../utils/apiPaths';

// Simple loader component for trainers
const TrainerLoader = ({ text = "Loading...", size = "md" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizeClasses[size]} border-2 border-white border-t-transparent rounded-full animate-spin`}></div>
      <span className="text-white font-black uppercase tracking-wide">{text}</span>
    </div>
  );
};

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTrainer, setSelectedTrainer] = useState(null);

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [trainers, searchQuery, statusFilter]);

  const fetchTrainers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data || []);
      setLocalError(null);
    } catch (err) {
      if (err.response?.status === 404) {
        setTrainers([]);
        setLocalError(err.response.data.message || "No trainers found");
      } else {
        setTrainers([]);
        setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filterTrainers = () => {
    let filtered = [...trainers];

    // Status filter first
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trainer => {
        const trainerStatus = trainer.status?.toLowerCase();
        return trainerStatus === statusFilter.toLowerCase();
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(trainer => {
        const nameMatch = trainer.trainerName?.toLowerCase().includes(searchLower);
        const emailMatch = trainer.email?.toLowerCase().includes(searchLower);
        
        let specialtyMatch = false;
        if (trainer.specialty) {
          if (Array.isArray(trainer.specialty)) {
            specialtyMatch = trainer.specialty.some(spec => 
              spec?.toLowerCase().includes(searchLower)
            );
          } else {
            specialtyMatch = trainer.specialty.toLowerCase().includes(searchLower);
          }
        }
        
        const qualificationMatch = trainer.qualifications?.toLowerCase().includes(searchLower);
        const experienceMatch = trainer.experience?.toLowerCase().includes(searchLower);
        
        return nameMatch || emailMatch || specialtyMatch || qualificationMatch || experienceMatch;
      });
    }

    setFilteredTrainers(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter('all');
  };

  const handleSocialClick = (platform, username) => {
    if (!username || username === "N/A") return;
    
    let url = '';
    if (platform === 'facebook') {
      url = username.startsWith('http') ? username : `https://facebook.com/${username}`;
    } else if (platform === 'instagram') {
      url = username.startsWith('http') ? username : `https://instagram.com/${username}`;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Reusable components
  const StatusBadge = ({ status, className = "" }) => (
    <div className={`px-4 py-2 text-xs font-black uppercase tracking-widest backdrop-blur-sm border-2 ${
      status?.toLowerCase() === 'active' 
        ? 'bg-green-500/90 text-white border-green-300' 
        : 'bg-red-500/90 text-white border-red-300'
    } ${className}`}>
      {status?.toLowerCase() === 'active' ? '✓ Active' : '⚠ Inactive'}
    </div>
  );

  const InfoCard = ({ icon: Icon, title, value, bgColor = "gray" }) => {
    const colorClasses = {
      gray: { bg: "bg-gray-50 border-gray-200 text-gray-500", icon: "bg-black text-white" },
      blue: { bg: "bg-blue-50 border-blue-200 text-blue-600", icon: "bg-blue-600 text-white" },
      green: { bg: "bg-green-50 border-green-200 text-green-600", icon: "bg-green-600 text-white" },
      purple: { bg: "bg-purple-50 border-purple-200 text-purple-600", icon: "bg-purple-600 text-white" }
    };

    const colors = colorClasses[bgColor];

    return (
      <div className={`flex items-center gap-3 p-3 border ${colors.bg}`}>
        <div className={`p-2 rounded-full ${colors.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className={`text-xs font-bold uppercase tracking-wide ${colors.bg.split(' ')[2]} mb-1`}>
            {title}
          </div>
          <span className="text-black font-bold">{value}</span>
        </div>
      </div>
    );
  };

  const TrainerModal = () => {
    if (!selectedTrainer) return null;

    const specialtyText = Array.isArray(selectedTrainer.specialty)
      ? selectedTrainer.specialty.join(', ')
      : selectedTrainer.specialty || "Not specified";

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white border-4 border-black max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6 pb-4 border-b-4 border-black">
              <div>
                <h2 className="text-3xl font-black text-black uppercase tracking-wider mb-2">
                  {selectedTrainer.trainerName}
                </h2>
                <div className="flex items-center gap-4">
                  <StatusBadge status={selectedTrainer.status} />
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-black" />
                    <span className="text-sm font-bold text-gray-600">Professional Trainer</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="text-black hover:bg-black hover:text-white p-3 border-2 border-black transition-all duration-200 font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6 text-black">
              {/* Left Column - Image and Basic Info */}
              <div className="space-y-4">
                {selectedTrainer.image && (
                  <div className="overflow-hidden border-4 border-black relative group">
                    <img
                      src={selectedTrainer.image}
                      alt={selectedTrainer.trainerName}
                      className="w-full h-64 sm:h-72 md:h-80 lg:h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                )}

                <div className="bg-gray-50 border-2 border-gray-200 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-black text-white p-2 rounded-full">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide text-gray-500">Specialty</div>
                  </div>
                  <p className="text-black font-bold ml-11">{specialtyText}</p>
                </div>

                {/* Social Links */}
                <div className="bg-black p-4 border-2 border-black">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white text-black p-2 rounded-full">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-bold uppercase tracking-wide text-white">Connect</div>
                  </div>
                  <div className="flex gap-2 ml-11">
                    {selectedTrainer?.socialLinks?.facebook && selectedTrainer.socialLinks.facebook !== "N/A" && (
                      <button
                        onClick={() => handleSocialClick('facebook', selectedTrainer.socialLinks.facebook)}
                        className="w-10 h-10 border-2 border-white bg-transparent text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center"
                        title="Visit Facebook Profile"
                      >
                        <Facebook className="w-4 h-4" />
                      </button>
                    )}
                    {selectedTrainer?.socialLinks?.instagram && selectedTrainer.socialLinks.instagram !== "N/A" && (
                      <button
                        onClick={() => handleSocialClick('instagram', selectedTrainer.socialLinks.instagram)}
                        className="w-10 h-10 border-2 border-white bg-transparent text-white hover:bg-white hover:text-black transition-all duration-200 flex items-center justify-center"
                        title="Visit Instagram Profile"
                      >
                        <Instagram className="w-4 h-4" />
                      </button>
                    )}
                    {(!selectedTrainer?.socialLinks?.facebook || selectedTrainer.socialLinks.facebook === "N/A") && 
                     (!selectedTrainer?.socialLinks?.instagram || selectedTrainer.socialLinks.instagram === "N/A") && (
                      <span className="text-sm text-gray-300">No social links</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Right Column - Details */}
              <div className="space-y-4">
                <InfoCard 
                  icon={Mail} 
                  title="Email" 
                  value={selectedTrainer.email} 
                  bgColor="blue"
                />
                
                <InfoCard 
                  icon={Briefcase} 
                  title="Experience" 
                  value={selectedTrainer.experience || "N/A"} 
                  bgColor="green"
                />

                {selectedTrainer?.contactInfo?.phone && selectedTrainer.contactInfo.phone !== "N/A" && (
                  <InfoCard 
                    icon={Phone} 
                    title="Phone" 
                    value={selectedTrainer.contactInfo.phone} 
                    bgColor="purple"
                  />
                )}

                {selectedTrainer?.contactInfo?.address && selectedTrainer.contactInfo.address !== "N/A" && (
                  <InfoCard 
                    icon={MapPin} 
                    title="Address" 
                    value={selectedTrainer.contactInfo.address} 
                  />
                )}

                {selectedTrainer.qualifications && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-yellow-600 text-white p-2 rounded-full">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide text-yellow-600">Qualifications</div>
                    </div>
                    <p className="text-black font-bold text-sm leading-relaxed ml-11">{selectedTrainer.qualifications}</p>
                  </div>
                )}

                {selectedTrainer.bio && (
                  <div className="bg-gray-50 border-2 border-gray-200 p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-black text-white p-2 rounded-full">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-xs font-bold uppercase tracking-wide text-gray-500">About</div>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed ml-11">{selectedTrainer.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-white min-h-screen pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="bg-black text-white p-8 border-4 border-black">
                <TrainerLoader text="Loading trainers..." size="lg" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="border-b-4 border-black pb-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div>
                <h1 className="text-6xl font-black text-black uppercase tracking-wider mb-2">
                  Expert Trainers
                </h1>
                <p className="text-xl text-gray-600 font-medium">
                  Meet our certified fitness professionals dedicated to your success
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-black text-white px-4 py-2 font-bold uppercase tracking-wide text-sm">
                  {filteredTrainers.length} Trainers Available
                </div>
              </div>
            </div>
          </div>
          
          {localError && (
            <div className="bg-red-50 border-2 border-red-500 text-red-800 px-6 py-4 mb-8 font-bold flex items-center gap-3">
              <div className="bg-red-500 text-white p-2 rounded-full">
                <X className="w-5 h-5" />
              </div>
              <span>{localError}</span>
            </div>
          )}

          <div className="bg-gray-50 border-2 border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="w-6 h-6 text-black" />
              <h2 className="text-xl font-black uppercase tracking-wide">Find Your Perfect Trainer</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full z-10">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search trainers, specialties, or qualifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 border-2 border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-black/20 font-medium text-lg"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-black" />
                  <span className="text-black font-black uppercase tracking-wide text-sm">Status:</span>
                </div>
                <div className="flex gap-2">
                  {['all', 'active', 'inactive'].map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-4 py-2 font-black text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
                        statusFilter === status
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {status === 'all' ? 'All' : status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {filteredTrainers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrainers.map((trainer) => (
                <TrainerCard 
                  key={trainer._id} 
                  trainer={trainer} 
                  onViewDetails={setSelectedTrainer}
                />
              ))}
            </div>
          )}

          {filteredTrainers.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-gray-100 border-2 border-gray-300 p-12 inline-block mb-6">
                <Users className="w-24 h-24 mx-auto text-gray-400" />
              </div>
              <h3 className="text-4xl font-black text-black mb-4 uppercase tracking-wide">
                No Trainers Found
              </h3>
              <p className="text-gray-600 text-xl mb-8 max-w-2xl mx-auto">
                {searchQuery 
                  ? `No trainers match your search "${searchQuery}". Try different keywords or clear your filters.`
                  : statusFilter !== 'all'
                    ? `No ${statusFilter} trainers found. Try adjusting your filter settings.`
                    : "No trainers are currently available. Please check back later."
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={clearFilters}
                  className="px-8 py-3 border-2 border-black font-bold uppercase tracking-wide transition-all duration-200 bg-black text-white hover:bg-gray-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <TrainerModal />
    </MainLayout>
  );
};

export default Trainers;