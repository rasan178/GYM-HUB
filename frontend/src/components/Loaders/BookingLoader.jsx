// frontend/src/components/Loaders/BookingLoader.jsx

import React from 'react';

const BookingLoader = ({ text = "Booking...", size = "sm" }) => {
  const sizeClasses = {
    xs: { dot: 'w-1.5 h-1.5', text: 'text-xs' },
    sm: { dot: 'w-2 h-2', text: 'text-sm' },
    md: { dot: 'w-3 h-3', text: 'text-base' },
    lg: { dot: 'w-4 h-4', text: 'text-lg' }
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Animated dots with staggered bounce */}
      <div className="flex gap-1">
        <div 
          className={`${currentSize.dot} bg-current rounded-full animate-bounce opacity-80`}
          style={{ animationDelay: '0ms', animationDuration: '1s' }}
        ></div>
        <div 
          className={`${currentSize.dot} bg-current rounded-full animate-bounce opacity-90`}
          style={{ animationDelay: '150ms', animationDuration: '1s' }}
        ></div>
        <div 
          className={`${currentSize.dot} bg-current rounded-full animate-bounce`}
          style={{ animationDelay: '300ms', animationDuration: '1s' }}
        ></div>
      </div>
      
      {/* Loading text with pulse animation */}
      <span className={`${currentSize.text} font-semibold animate-pulse`}>
        {text}
      </span>
    </div>
  );
};

// Professional spinner version with modern design
export const BookingSpinner = ({ text = "Processing...", size = "sm", variant = "primary" }) => {
  const sizeClasses = {
    xs: { spinner: 'w-3 h-3 border', text: 'text-xs' },
    sm: { spinner: 'w-4 h-4 border-2', text: 'text-sm' },
    md: { spinner: 'w-6 h-6 border-2', text: 'text-base' },
    lg: { spinner: 'w-8 h-8 border-3', text: 'text-lg' }
  };

  const variants = {
    primary: 'border-current border-t-transparent',
    inverse: 'border-white/30 border-t-white',
    accent: 'border-gray-300 border-t-black'
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;
  const currentVariant = variants[variant] || variants.primary;

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Modern spinning circle */}
      <div className={`${currentSize.spinner} ${currentVariant} rounded-full animate-spin`}></div>
      
      {/* Loading text */}
      <span className={`${currentSize.text} font-semibold`}>
        {text}
      </span>
    </div>
  );
};

// Elegant pulse version with breathing effect
export const BookingPulse = ({ text = "Loading...", size = "sm", intensity = "normal" }) => {
  const sizeClasses = {
    xs: { circle: 'w-2 h-2', text: 'text-xs' },
    sm: { circle: 'w-3 h-3', text: 'text-sm' },
    md: { circle: 'w-4 h-4', text: 'text-base' },
    lg: { circle: 'w-5 h-5', text: 'text-lg' }
  };

  const intensityClasses = {
    subtle: 'animate-pulse opacity-60',
    normal: 'animate-pulse opacity-80',
    strong: 'animate-pulse opacity-100'
  };

  const currentSize = sizeClasses[size] || sizeClasses.sm;
  const currentIntensity = intensityClasses[intensity] || intensityClasses.normal;

  return (
    <div className="flex items-center justify-center gap-3">
      {/* Breathing circle with ripple effect */}
      <div className="relative">
        <div className={`${currentSize.circle} bg-current rounded-full ${currentIntensity}`}></div>
        <div className={`${currentSize.circle} bg-current rounded-full absolute inset-0 ${currentIntensity}`}
             style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      {/* Loading text with synchronized pulse */}
      <span className={`${currentSize.text} font-semibold ${currentIntensity}`}>
        {text}
      </span>
    </div>
  );
};

// Advanced skeleton loader for booking cards
export const BookingSkeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 h-48 w-full mb-4"></div>
      <div className="space-y-3">
        <div className="bg-gray-200 h-4 w-3/4 rounded"></div>
        <div className="bg-gray-200 h-3 w-full rounded"></div>
        <div className="bg-gray-200 h-3 w-5/6 rounded"></div>
        <div className="flex space-x-2">
          <div className="bg-gray-200 h-3 w-1/3 rounded"></div>
          <div className="bg-gray-200 h-3 w-1/4 rounded"></div>
        </div>
        <div className="bg-gray-200 h-10 w-full rounded mt-4"></div>
      </div>
    </div>
  );
};

// Complete loading state component
export const LoadingState = ({ 
  text = "Loading...", 
  type = "bounce", 
  size = "md",
  fullScreen = false 
}) => {
  const LoaderComponent = {
    bounce: BookingLoader,
    spin: BookingSpinner,
    pulse: BookingPulse
  }[type] || BookingLoader;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <LoaderComponent text={text} size={size} />
      <div className="text-center max-w-md">
        <p className="text-sm text-gray-500">
          Please wait while we process your request...
        </p>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return (
    <div className="py-12">
      {content}
    </div>
  );
};

export default BookingLoader;