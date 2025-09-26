import { useEffect, useState } from 'react';
import { Search, Filter, Users, AlertCircle, Loader, SortAsc, Grid, List, ArrowUpDown, Facebook, Instagram } from 'lucide-react';
import api from '../utils/axiosInstance';
import MainLayout from '../components/Layouts/MainLayout';
import TrainerCard from '../components/Cards/TrainerCard';
import { API_PATHS } from '../utils/apiPaths';

const Trainers = () => {
  const [trainers, setTrainers] = useState([]);
  const [filteredTrainers, setFilteredTrainers] = useState([]);
  const [localError, setLocalError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchTrainers();
  }, []);

  useEffect(() => {
    filterTrainers();
  }, [trainers, searchTerm, statusFilter]);

  const fetchTrainers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(API_PATHS.TRAINERS.GET_ALL);
      setTrainers(res.data);
      setLocalError(null);
    } catch (err) {
      setLocalError(err.response?.data?.message || 'Failed to fetch trainers');
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

    // Search filter - handle array specialty properly
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(trainer => {
        // Check name and email
        const nameMatch = trainer.trainerName?.toLowerCase().includes(searchLower);
        const emailMatch = trainer.email?.toLowerCase().includes(searchLower);
        
        // Handle specialty - could be string or array
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
        
        // Also check qualifications and experience
        const qualificationMatch = trainer.qualifications?.toLowerCase().includes(searchLower);
        const experienceMatch = trainer.experience?.toLowerCase().includes(searchLower);
        
        return nameMatch || emailMatch || specialtyMatch || qualificationMatch || experienceMatch;
      });
    }

    setFilteredTrainers(filtered);
  };

  // Add this function for social media links in list view
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

  const handleRetry = () => {
    setLocalError(null);
    fetchTrainers();
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="pt-16 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="w-12 h-12 text-white animate-spin mb-4" />
            <p className="text-lg font-semibold text-white">Loading trainers...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="pt-16 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="relative py-12 mb-12 overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px), radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 border-4 border-white rounded-full mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
              OUR TRAINERS
            </h1>
            <div className="w-24 h-1 bg-white mx-auto mb-4"></div>
            <p className="text-white text-xl max-w-2xl mx-auto leading-relaxed">
              Meet our certified fitness professionals dedicated to your success
            </p>
          </div>
        </div>

        {/* Error Message */}
        {localError && (
          <div className="mb-8">
            <div className="border-2 border-white bg-black p-4 flex items-start">
              <AlertCircle className="w-5 h-5 text-white mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-white font-semibold mb-2">Error Loading Trainers</p>
                <p className="text-white text-sm mb-3">{localError}</p>
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-white text-black border-2 border-white hover:bg-black hover:text-white transition-colors duration-200 font-semibold"
                >
                  RETRY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="mb-12">
          <div className="bg-white border-4 border-white p-6 shadow-2xl">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search trainers by name, specialty, qualifications, or experience..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-black focus:outline-none transition-colors bg-white text-black placeholder-gray-400"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Filter Section */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-5 h-5 text-black" />
                    <span className="text-black font-semibold text-lg">Status:</span>
                  </div>
                  <div className="flex space-x-2">
                    {['all', 'active', 'inactive'].map(status => (
                      <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-6 py-2 font-semibold text-sm uppercase tracking-wide transition-all duration-200 border-2 ${
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

                {/* Sort and View Controls */}
                <div className="flex items-center space-x-4">
                  {/* Sort Dropdown */}
                  <div className="flex items-center space-x-2">
                    <ArrowUpDown className="w-5 h-5 text-black" />
                    <span className="text-black font-semibold">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border-2 border-black bg-white text-black focus:outline-none font-semibold"
                    >
                      <option value="name">Name</option>
                      <option value="experience">Experience</option>
                      <option value="status">Status</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex border-2 border-black">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-black text-white' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      title="Grid View"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-black text-white' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Results Count and Active Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t-2 border-gray-200">
                <div className="text-black font-semibold text-lg">
                  <span className="bg-black text-white px-3 py-1 mr-2">
                    {filteredTrainers.length}
                  </span>
                  of {trainers.length} trainers
                  {searchTerm.trim() && (
                    <span className="text-gray-600 ml-2">
                      for "{searchTerm.trim()}"
                    </span>
                  )}
                </div>
                
                {/* Active Filters Display */}
                {(searchTerm.trim() || statusFilter !== 'all' || sortBy !== 'name') && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-gray-600">Active filters:</span>
                    {statusFilter !== 'all' && (
                      <span className="bg-gray-200 px-2 py-1 rounded">
                        Status: {statusFilter}
                      </span>
                    )}
                    {searchTerm.trim() && (
                      <span className="bg-gray-200 px-2 py-1 rounded">
                        Search: {searchTerm.trim()}
                      </span>
                    )}
                    {sortBy !== 'name' && (
                      <span className="bg-gray-200 px-2 py-1 rounded">
                        Sort: {sortBy}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trainers Grid/List */}
        {filteredTrainers.length > 0 ? (
          <div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
                {filteredTrainers.map(trainer => (
                  <TrainerCard key={trainer._id} trainer={trainer} />
                ))}
              </div>
            ) : (
              <div className="space-y-6 pb-12">
                {filteredTrainers.map(trainer => (
                  <div key={trainer._id} className="bg-white border-4 border-black p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        <img
                          src={trainer.image || '/images/default-trainer.png'}
                          alt={trainer.trainerName}
                          className="w-32 h-32 object-cover border-2 border-black"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold text-black">{trainer.trainerName}</h3>
                            <p className="text-gray-600">{Array.isArray(trainer.specialty) ? trainer.specialty.join(', ') : trainer.specialty}</p>
                          </div>
                          <div className={`px-3 py-1 text-xs font-bold border-2 ${
                            trainer.status?.toLowerCase() === 'active' 
                              ? 'bg-white text-black border-black' 
                              : 'bg-black text-white border-black'
                          }`}>
                            {trainer.status?.toUpperCase() || 'UNKNOWN'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-semibold">Email:</span> {trainer.email}
                          </div>
                          <div>
                            <span className="font-semibold">Experience:</span> {trainer.experience}
                          </div>
                          {trainer?.contactInfo?.phone && (
                            <div>
                              <span className="font-semibold">Phone:</span> {trainer.contactInfo.phone}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold">Qualifications:</span> {trainer.qualifications}
                          </div>
                        </div>
                        
                        {trainer.bio && (
                          <p className="text-sm text-gray-700 line-clamp-2">{trainer.bio}</p>
                        )}
                        
                        {/* Social Links */}
                        <div className="flex items-center space-x-3 pt-2">
                          {trainer?.socialLinks?.facebook && trainer.socialLinks.facebook !== "N/A" && (
                            <button
                              onClick={() => handleSocialClick('facebook', trainer.socialLinks.facebook)}
                              className="w-8 h-8 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                            >
                              <Facebook className="w-4 h-4" />
                            </button>
                          )}
                          {trainer?.socialLinks?.instagram && trainer.socialLinks.instagram !== "N/A" && (
                            <button
                              onClick={() => handleSocialClick('instagram', trainer.socialLinks.instagram)}
                              className="w-8 h-8 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center"
                            >
                              <Instagram className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-black" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              {searchTerm.trim() || statusFilter !== 'all' ? 'No trainers found' : 'No trainers available'}
            </h3>
            <p className="text-white text-lg mb-6 max-w-md mx-auto">
              {searchTerm.trim() || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.' 
                : 'Check back later for available trainers.'
              }
            </p>
            {(searchTerm.trim() || statusFilter !== 'all' || sortBy !== 'name') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortBy('name');
                }}
                className="px-8 py-3 bg-white text-black border-2 border-white hover:bg-black hover:text-white hover:border-white transition-all duration-200 font-semibold text-lg"
              >
                RESET ALL FILTERS
              </button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Trainers;