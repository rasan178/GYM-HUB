import { XCircle, AlertTriangle } from 'lucide-react';

const MembershipErrorDisplay = ({ 
  isOpen, 
  onClose, 
  title = "Request Failed", 
  message = "You already have an active membership. Please wait until it expires before requesting a new one.",
  type = "error" // "error" or "warning"
}) => {
  if (!isOpen) return null;

  const isError = type === "error";
  const bgColor = isError ? "bg-red-500" : "bg-yellow-500";
  const borderColor = isError ? "border-red-500" : "border-yellow-500";
  const textColor = isError ? "text-red-600" : "text-yellow-600";
  const buttonColor = isError ? "bg-red-500 hover:bg-red-600 border-red-500" : "bg-yellow-500 hover:bg-yellow-600 border-yellow-500";
  const IconComponent = isError ? XCircle : AlertTriangle;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-white text-black p-8 border-4 ${borderColor} max-w-md w-full shadow-2xl text-center transform transition-all duration-300 scale-100`}>
        {/* Icon */}
        <div className={`${bgColor} text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
          <IconComponent className="w-8 h-8" />
        </div>

        {/* Title */}
        <h3 className={`text-2xl font-black mb-4 uppercase tracking-wider ${textColor}`}>
          {title}
        </h3>

        {/* Message */}
        <p className="text-gray-700 font-medium mb-6 leading-relaxed">
          {message}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`${buttonColor} text-white px-6 py-3 font-black uppercase tracking-widest transition-all border-2 hover:shadow-lg transform hover:scale-105`}
        >
          Close
        </button>

        {/* Decorative Elements */}
        <div className="absolute top-4 right-4">
          <div className={`w-3 h-3 ${bgColor} rounded-full opacity-20`}></div>
        </div>
        <div className="absolute bottom-4 left-4">
          <div className={`w-2 h-2 ${bgColor} rounded-full opacity-30`}></div>
        </div>
      </div>
    </div>
  );
};

export default MembershipErrorDisplay;
