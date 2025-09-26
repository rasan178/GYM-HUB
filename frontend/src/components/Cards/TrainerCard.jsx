import { User, Mail, Award, Calendar, FileText, CheckCircle, Phone, MapPin, Facebook, Instagram, Star, Briefcase } from 'lucide-react';

const TrainerCard = ({ trainer }) => {
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

  return (
    <div className="group relative bg-white border-4 border-black shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
      {/* Image Section with Overlay */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 z-10"></div>
        <img
          src={trainer.image || '/images/default-trainer.png'}
          alt={trainer.trainerName}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Status Badge */}
        <div className="absolute top-4 right-4 z-20">
          <div className={`px-4 py-2 text-xs font-bold border-2 transition-all duration-300 ${
            trainer.status?.toLowerCase() === 'active' 
              ? 'bg-white text-black border-black group-hover:bg-black group-hover:text-white' 
              : 'bg-black text-white border-white group-hover:bg-white group-hover:text-black'
          }`}>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                trainer.status?.toLowerCase() === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>{trainer.status?.toUpperCase() || 'UNKNOWN'}</span>
            </div>
          </div>
        </div>

        {/* Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 z-20">
          <h2 className="text-2xl font-bold text-white mb-1">{trainer.trainerName}</h2>
          <p className="text-white/80 text-sm">{specialtyText}</p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b-2 border-gray-100">
          <div className="text-center">
            <Briefcase className="w-5 h-5 mx-auto text-black mb-1" />
            <p className="text-xs font-semibold text-gray-600">EXPERIENCE</p>
            <p className="text-sm font-bold text-black">{trainer.experience || 'N/A'}</p>
          </div>
          <div className="text-center">
            <Star className="w-5 h-5 mx-auto text-black mb-1" />
            <p className="text-xs font-semibold text-gray-600">STATUS</p>
            <p className="text-sm font-bold text-black">{trainer.status?.toUpperCase() || 'N/A'}</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center group/item hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
            <Mail className="w-4 h-4 mr-3 text-black flex-shrink-0" />
            <span className="text-sm text-black truncate">{trainer.email}</span>
          </div>
          
          {trainer?.contactInfo?.phone && trainer.contactInfo.phone !== "N/A" && (
            <div className="flex items-center group/item hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <Phone className="w-4 h-4 mr-3 text-black flex-shrink-0" />
              <span className="text-sm text-black">{trainer.contactInfo.phone}</span>
            </div>
          )}
          
          {trainer?.contactInfo?.address && trainer.contactInfo.address !== "N/A" && (
            <div className="flex items-start group/item hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors">
              <MapPin className="w-4 h-4 mr-3 mt-0.5 text-black flex-shrink-0" />
              <span className="text-sm text-black leading-tight">{trainer.contactInfo.address}</span>
            </div>
          )}
        </div>

        {/* Qualifications */}
        {trainer.qualifications && (
          <div className="bg-gray-50 border-l-4 border-black p-3">
            <div className="flex items-start">
              <CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-black flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Qualifications</span>
                <p className="text-sm text-black mt-1 leading-tight">{trainer.qualifications}</p>
              </div>
            </div>
          </div>
        )}

        {/* Bio */}
        {trainer.bio && (
          <div className="bg-gray-50 p-3">
            <div className="flex items-start">
              <FileText className="w-4 h-4 mr-2 mt-0.5 text-black flex-shrink-0" />
              <div>
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">About</span>
                <p className="text-sm text-black mt-1 leading-relaxed line-clamp-3">{trainer.bio}</p>
              </div>
            </div>
          </div>
        )}

        {/* Social Media Footer */}
        <div className="border-t-2 border-black pt-4 mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-black uppercase tracking-wide">Connect</span>
            <div className="flex space-x-2">
              {trainer?.socialLinks?.facebook && trainer.socialLinks.facebook !== "N/A" && (
                <button
                  onClick={() => handleSocialClick('facebook', trainer.socialLinks.facebook)}
                  className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center group/social"
                  title="Visit Facebook Profile"
                >
                  <Facebook className="w-4 h-4" />
                </button>
              )}
              
              {trainer?.socialLinks?.instagram && trainer.socialLinks.instagram !== "N/A" && (
                <button
                  onClick={() => handleSocialClick('instagram', trainer.socialLinks.instagram)}
                  className="w-10 h-10 border-2 border-black bg-white hover:bg-black hover:text-white transition-all duration-200 flex items-center justify-center group/social"
                  title="Visit Instagram Profile"
                >
                  <Instagram className="w-4 h-4" />
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

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-4 border-transparent group-hover:border-black/20 pointer-events-none transition-all duration-300"></div>
    </div>
  );
};

export default TrainerCard;