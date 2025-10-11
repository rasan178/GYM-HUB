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
  const accentColor = isError ? "bg-red-500" : "bg-amber-500";
  const IconComponent = isError ? XCircle : AlertTriangle;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all border-2 border-black">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-2 border-black bg-black text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${accentColor} text-white`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {title}
                </h3>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 bg-white">
          <div className="space-y-4">
            <p className="text-sm sm:text-base leading-relaxed text-black">
              {message}
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button
                onClick={onClose}
                className={`flex-1 ${accentColor} text-white px-4 py-3 rounded-lg hover:opacity-90 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-2 border-transparent`}
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembershipErrorDisplay;
