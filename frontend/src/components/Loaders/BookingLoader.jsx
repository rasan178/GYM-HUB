// frontend/src/components/Loaders/BookingLoader.jsx

import React from 'react';

const BookingLoader = ({ text = "Booking..." }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {/* Animated dots */}
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      
      {/* Loading text */}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

// Alternative spinner version
export const BookingSpinner = ({ text = "Booking..." }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {/* Spinning circle */}
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      
      {/* Loading text */}
      <span className="text-sm font-medium">{text}</span>
    </div>
  );
};

// Pulse version for a more subtle effect
export const BookingPulse = ({ text = "Booking..." }) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {/* Pulsing circle */}
      <div className="w-3 h-3 bg-current rounded-full animate-pulse"></div>
      
      {/* Loading text */}
      <span className="text-sm font-medium animate-pulse">{text}</span>
    </div>
  );
};

export default BookingLoader;