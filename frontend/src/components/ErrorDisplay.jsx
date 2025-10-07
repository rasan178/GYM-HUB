import { AlertTriangle, XCircle, Mail, Phone } from 'lucide-react';

const ErrorDisplay = ({ error, onClose, className = "" }) => {
  if (!error) return null;

  // Only handle account suspension/deactivation errors
  const isSuspended = error?.includes('suspended');
  const isDeactivated = error?.includes('deactivated');
  const isAccountIssue = isSuspended || isDeactivated;
  
  // Don't show this component for other types of errors
  if (!isAccountIssue) return null;

  // Use a user-friendly message regardless of the simple backend message
  const userFriendlyMessage = "Your account has been temporarily suspended. Please contact our support team for assistance.";

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all border-2 border-black">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b-2 border-black bg-black text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-500 text-white">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  Account Suspended
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
              {userFriendlyMessage}
            </p>

            <div className="bg-blue-50 text-blue-900 rounded-lg p-4 border-2 border-blue-200">
              <h4 className="font-semibold text-sm mb-3">How to get help:</h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-blue-500 text-white rounded">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>Email: support@gymhub.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 bg-green-500 text-white rounded">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>Call: (555) 123-GYM</span>
                </div>
              </div>
              <p className="text-xs mt-3 font-medium">
                Our support team is available 24/7 to help resolve account issues quickly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <button
                onClick={() => window.location.href = 'mailto:support@gymhub.com'}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-2 border-blue-600"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-white text-black px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold border-2 border-black"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
