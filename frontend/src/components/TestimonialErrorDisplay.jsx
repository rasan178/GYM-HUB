import { AlertTriangle, XCircle, Clock, Edit, Info } from 'lucide-react';

const TestimonialErrorDisplay = ({ error, onClose, onCreateNew, className = "" }) => {
  if (!error) return null;

  // Only handle testimonial editing period expiration errors
  const isEditingPeriodError = error?.includes('Cannot edit testimonial') && error?.includes('editing period has expired');
  
  // Don't show this component for other types of errors
  if (!isEditingPeriodError) return null;

  // Extract the number of days expired from the error message
  const daysMatch = error.match(/(\d+) day\(s\) ago/);
  const daysExpired = daysMatch ? daysMatch[1] : 'several';

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all border-2 border-black">
        {/* Header */}
        <div className="p-4 sm:p-6  bg-blue-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-600 text-white">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  Editing Period Expired
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
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-orange-100 text-orange-600 flex-shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base leading-relaxed text-black font-medium">
                  Your testimonial can no longer be edited.
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  The 10-day editing period expired {daysExpired} day{daysExpired !== '1' ? 's' : ''} ago.
                </p>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-900 rounded-lg p-4 border-2 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-500 text-white rounded flex-shrink-0">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Why can't I edit my testimonial?</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Testimonials can only be edited within 10 days of creation</li>
                    <li>• This policy helps maintain the authenticity of reviews</li>
                    <li>• It prevents abuse and ensures genuine feedback</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-green-50 text-green-900 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500 text-white rounded flex-shrink-0">
                  <Edit className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">What can I do instead?</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Submit a new testimonial with updated information</li>
                    <li>• Contact support if you need to make corrections</li>
                    <li>• Your original testimonial will remain visible</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => {
                  if (onClose) onClose();
                  if (onCreateNew) onCreateNew();
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-2 border-blue-600"
              >
                <Edit className="w-4 h-4" />
                Create New Testimonial
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-white text-black px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold border-2 border-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialErrorDisplay;
