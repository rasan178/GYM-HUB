import { User, Mail, Award, Calendar, FileText, CheckCircle, Phone, MapPin, Star, Briefcase, Eye, Users } from 'lucide-react';
import { FaFacebook, FaInstagram } from 'react-icons/fa';

const TrainerCard = ({ trainer, onViewDetails }) => {
  // safely handle specialty
  const specialtyText = Array.isArray(trainer.specialty)
    ? trainer.specialty.join(', ')
    : trainer.specialty || "Not specified";

  // Handle social media links
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

  return (
    <div className="group bg-white border-2 border-black shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
      <div className="relative overflow-hidden">
        <img
          src={trainer.image || '/images/default-trainer.png'}
          alt={trainer.trainerName}
          className="w-full h-64 sm:h-72 md:h-64 lg:h-72 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <div className="absolute top-4 right-4">
          <button
            onClick={() => onViewDetails && onViewDetails(trainer)}
            className="bg-white/90 backdrop-blur-sm text-black p-3 rounded-full hover:bg-white hover:shadow-lg transform hover:scale-110 transition-all duration-300"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
        
        <StatusBadge status={trainer.status} className="absolute top-4 left-4" />
        
        {trainer.featured && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-3 py-1 text-xs font-black uppercase tracking-wide border-2 border-yellow-300">
            <Star className="w-3 h-3 inline mr-1" />
            Featured
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-black text-black mb-2 leading-tight group-hover:text-gray-800 transition-colors">
            {trainer.trainerName}
          </h2>
          <p className="text-gray-600 line-clamp-2 leading-relaxed text-sm">
            {specialtyText}
          </p>
        </div>
        
        <div className="space-y-3">
          <InfoCard 
            icon={Mail} 
            title="Email" 
            value={trainer.email || "N/A"} 
          />
          
          <InfoCard 
            icon={Briefcase} 
            title="Experience" 
            value={trainer.experience || "N/A"} 
            bgColor="blue"
          />

          {trainer.qualifications && (
            <InfoCard 
              icon={Award} 
              title="Qualifications" 
              value={trainer.qualifications} 
              bgColor="green"
            />
          )}

          {trainer?.contactInfo?.phone && trainer.contactInfo.phone !== "N/A" && (
            <InfoCard 
              icon={Phone} 
              title="Phone" 
              value={trainer.contactInfo.phone} 
              bgColor="purple"
            />
          )}
        </div>

        {/* Bio */}
        {trainer.bio && (
          <div className="p-3 bg-gray-50 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-black text-white p-2 rounded-full">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wide text-gray-500">About Trainer</div>
            </div>
            <div className="ml-12">
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{trainer.bio}</p>
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="border-t-2 border-black pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black uppercase tracking-wide text-black flex items-center gap-2">
              <Users className="w-4 h-4" />
              Connect
            </span>
            <div className="flex space-x-2">
              {trainer?.socialLinks?.facebook && trainer.socialLinks.facebook !== "N/A" && (
                <button
                  onClick={() => handleSocialClick('facebook', trainer.socialLinks.facebook)}
                  className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center group/social"
                  title="Visit Facebook Profile"
                >
                  <FaFacebook className="w-4 h-4" />
                </button>
              )}
              
              {trainer?.socialLinks?.instagram && trainer.socialLinks.instagram !== "N/A" && (
                <button
                  onClick={() => handleSocialClick('instagram', trainer.socialLinks.instagram)}
                  className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center group/social"
                  title="Visit Instagram Profile"
                >
                  <FaInstagram className="w-4 h-4" />
                </button>
              )}
              
              {(!trainer?.socialLinks?.facebook || trainer.socialLinks.facebook === "N/A") && 
               (!trainer?.socialLinks?.instagram || trainer.socialLinks.instagram === "N/A") && (
                <span className="text-xs text-gray-500 py-2">No social links</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerCard;