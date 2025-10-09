import { AlertTriangle, XCircle, Calendar, Users, Clock, Info, Zap } from 'lucide-react';

const BookingErrorDisplay = ({ 
  isOpen, 
  onClose, 
  error, 
  className = "" 
}) => {
  if (!isOpen || !error) return null;

  // Determine error type and styling
  const isCapacityError = error?.includes('fully booked') || error?.includes('capacity');
  const isDuplicateError = error?.includes('already booked') || error?.includes('duplicate');
  const isScheduleError = error?.includes('scheduled') || error?.includes('day');
  const isCancelledError = error?.includes('cancelled');
  const isDateError = error?.includes('date');
  const isClassDeactivatedError = error?.includes('class') && (error?.includes('suspended') || error?.includes('deactivated')) && !error?.includes('trainer');
  const isTrainerDeactivatedError = error?.includes('trainer') && (error?.includes('suspended') || error?.includes('deactivated')) && !error?.includes('class');
  const isBothDeactivatedError = error?.includes('class') && error?.includes('trainer') && (error?.includes('suspended') || error?.includes('deactivated'));
  const isClassError = error?.includes('class') && !isCapacityError && !isClassDeactivatedError;
  const isGeneralError = !isCapacityError && !isDuplicateError && !isScheduleError && !isCancelledError && !isDateError && !isClassError && !isClassDeactivatedError && !isTrainerDeactivatedError && !isBothDeactivatedError;

  // Get appropriate icon and colors based on error type
  const getErrorConfig = () => {
    if (isCapacityError) {
      return {
        icon: Users,
        bgColor: "bg-orange-500",
        headerBg: "bg-orange-500",
        borderColor: "border-orange-500",
        textColor: "text-orange-600",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600"
      };
    }
    if (isDuplicateError) {
      return {
        icon: AlertTriangle,
        bgColor: "bg-yellow-500",
        headerBg: "bg-yellow-500",
        borderColor: "border-yellow-500",
        textColor: "text-yellow-600",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
      };
    }
    if (isClassDeactivatedError || isTrainerDeactivatedError || isBothDeactivatedError) {
      return {
        icon: XCircle,
        bgColor: "bg-red-600",
        headerBg: "bg-red-600",
        borderColor: "border-red-600",
        textColor: "text-red-700",
        iconBg: "bg-red-100",
        iconColor: "text-red-700"
      };
    }
    if (isScheduleError || isCancelledError) {
      return {
        icon: Calendar,
        bgColor: "bg-red-500",
        headerBg: "bg-red-500",
        borderColor: "border-red-500",
        textColor: "text-red-600",
        iconBg: "bg-red-100",
        iconColor: "text-red-600"
      };
    }
    if (isDateError) {
      return {
        icon: Clock,
        bgColor: "bg-blue-500",
        headerBg: "bg-blue-500",
        borderColor: "border-blue-500",
        textColor: "text-blue-600",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600"
      };
    }
    // Default/general error
    return {
      icon: XCircle,
      bgColor: "bg-red-500",
      headerBg: "bg-red-500",
      borderColor: "border-red-500",
      textColor: "text-red-600",
      iconBg: "bg-red-100",
      iconColor: "text-red-600"
    };
  };

  const config = getErrorConfig();
  const IconComponent = config.icon;

  // Get appropriate title and suggestions
  const getErrorContent = () => {
    if (isCapacityError) {
      return {
        title: "Class Full",
        suggestions: [
          "Try booking a different time slot",
          "Check other available classes",
          "Book for a different date"
        ]
      };
    }
    if (isDuplicateError) {
      return {
        title: "Already Booked",
        suggestions: [
          "Check your existing bookings",
          "Try booking a different class",
          "Choose a different time slot"
        ]
      };
    }
    if (isClassDeactivatedError) {
      return {
        title: "Class Suspended",
        suggestions: [
          "Choose a different class",
          "Check other available sessions",
          "Contact support for more information"
        ]
      };
    }
    if (isTrainerDeactivatedError) {
      return {
        title: "Trainer Unavailable",
        suggestions: [
          "Book with a different trainer",
          "Choose another class",
          "Contact support for assistance"
        ]
      };
    }
    if (isBothDeactivatedError) {
      return {
        title: "Service Unavailable",
        suggestions: [
          "Select a different class",
          "Try booking with another trainer",
          "Contact support for more options"
        ]
      };
    }
    if (isScheduleError) {
      return {
        title: "Schedule Issue",
        suggestions: [
          "Select a different date",
          "Check the class schedule",
          "Try another day of the week"
        ]
      };
    }
    if (isCancelledError) {
      return {
        title: "Class Cancelled",
        suggestions: [
          "Select a different date",
          "Choose another class",
          "Check for alternative sessions"
        ]
      };
    }
    if (isDateError) {
      return {
        title: "Date Required",
        suggestions: [
          "Select a date from the calendar",
          "Choose today or a future date",
          "Make sure the date is valid"
        ]
      };
    }
    if (isClassError) {
      return {
        title: "Class Issue",
        suggestions: [
          "Try a different class",
          "Check class availability",
          "Contact support if the issue persists"
        ]
      };
    }
    return {
      title: "Booking Failed",
      suggestions: [
        "Please try again",
        "Check your internet connection",
        "Contact support if the problem continues"
      ]
    };
  };

  const content = getErrorContent();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 ${className}`}>
      <div className={`bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 transform transition-all border-2 ${config.borderColor}`}>
        {/* Header */}
        <div className={`p-4 sm:p-6 ${config.headerBg} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-white bg-opacity-20 text-white">
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">
                  {content.title}
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
              <div className={`p-2 rounded-full ${config.iconBg} ${config.iconColor} flex-shrink-0`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm sm:text-base leading-relaxed text-black font-medium">
                  {error}
                </p>
              </div>
            </div>

            <div className={`${config.iconBg} text-gray-900 rounded-lg p-4 border-2 border-gray-200`}>
              <div className="flex items-start gap-3">
                <div className={`p-1 ${config.bgColor} text-white rounded flex-shrink-0`}>
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">What you can do:</h4>
                  <ul className="text-sm space-y-1">
                    {content.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Special section for admin deactivation errors */}
            {(isClassDeactivatedError || isTrainerDeactivatedError || isBothDeactivatedError) && (
              <div className="bg-red-50 text-red-900 rounded-lg p-4 border-2 border-red-200">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-red-600 text-white rounded flex-shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2">
                      {isClassDeactivatedError && "Class Temporarily Suspended"}
                      {isTrainerDeactivatedError && "Trainer Temporarily Unavailable"}
                      {isBothDeactivatedError && "Service Temporarily Unavailable"}
                    </h4>
                    <p className="text-sm mb-2">
                      {isClassDeactivatedError && "This class has been temporarily suspended by gym administration. This may be due to maintenance, instructor unavailability, or other operational reasons."}
                      {isTrainerDeactivatedError && "The assigned trainer is temporarily unavailable. This may be due to personal leave, scheduling conflicts, or other reasons."}
                      {isBothDeactivatedError && "Both the class and trainer are temporarily unavailable. This may be due to maintenance, scheduling conflicts, or other operational reasons."}
                    </p>
                    <div className="text-xs text-red-700">
                      <p className="font-medium mb-1">Need more information?</p>
                      <p>Contact our support team at support@gymhub.com or call (555) 123-GYM for assistance.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 text-green-900 rounded-lg p-4 border-2 border-green-200">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-green-500 text-white rounded flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">Quick Actions:</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        if (onClose) onClose();
                        // Scroll to date picker
                        const dateInput = document.querySelector('input[type="date"]');
                        if (dateInput) {
                          dateInput.focus();
                          dateInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                      }}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors"
                    >
                      Select Date
                    </button>
                    <button
                      onClick={() => {
                        if (onClose) onClose();
                        // Clear search and filters
                        const searchInput = document.querySelector('input[type="text"]');
                        if (searchInput) {
                          searchInput.value = '';
                          searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                      }}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              {(isClassDeactivatedError || isTrainerDeactivatedError || isBothDeactivatedError) ? (
                <>
                  <button
                    onClick={() => window.location.href = 'mailto:support@gymhub.com'}
                    className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-2 border-red-600"
                  >
                    <Info className="w-4 h-4" />
                    Contact Support
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 bg-white text-black px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold border-2 border-black"
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onClose}
                    className={`flex-1 ${config.bgColor} text-white px-4 py-3 rounded-lg hover:opacity-90 transition-colors text-sm font-bold flex items-center justify-center gap-2 border-2 ${config.borderColor}`}
                  >
                    <XCircle className="w-4 h-4" />
                    Close
                  </button>
                  <button
                    onClick={() => {
                      if (onClose) onClose();
                      // Refresh the page to reload classes
                      window.location.reload();
                    }}
                    className="flex-1 bg-white text-black px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold border-2 border-black"
                  >
                    Refresh
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingErrorDisplay;
