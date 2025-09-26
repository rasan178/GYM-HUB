// frontend/src/components/Loaders/BookingLoader.jsx

import React from 'react';

// Consolidated size configurations
const SIZES = {
  xs: { dot: 'w-1.5 h-1.5', text: 'text-xs', gap: 'gap-1', spinner: 'w-4 h-4 border-2' },
  sm: { dot: 'w-2 h-2', text: 'text-sm', gap: 'gap-1.5', spinner: 'w-5 h-5 border-2' },
  md: { dot: 'w-3 h-3', text: 'text-base', gap: 'gap-2', spinner: 'w-7 h-7 border-3' },
  lg: { dot: 'w-4 h-4', text: 'text-lg', gap: 'gap-3', spinner: 'w-9 h-9 border-4' }
};

// Shared shimmer effect component
const ShimmerEffect = () => (
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_1.5s_infinite]"></div>
);

// Animated dots with wave effect
const AnimatedDots = ({ size = "sm", count = 3 }) => {
  const currentSize = SIZES[size] || SIZES.sm;
  
  return (
    <div className={`flex ${currentSize.gap}`}>
      {Array.from({ length: count }, (_, i) => (
        <div 
          key={i}
          className={`${currentSize.dot} bg-current rounded-full animate-bounce opacity-${70 + i * 15} transform transition-all`}
          style={{ 
            animationDelay: `${i * 160}ms`, 
            animationDuration: '0.8s',
            animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
          }}
        />
      ))}
    </div>
  );
};

// Main loader with dots
const BookingLoader = ({ text = "Booking...", size = "sm" }) => {
  const currentSize = SIZES[size] || SIZES.sm;

  return (
    <div className="flex items-center justify-center gap-4">
      <AnimatedDots size={size} />
      <span className={`${currentSize.text} font-bold tracking-wider uppercase relative overflow-hidden`}>
        <span className="inline-block animate-pulse">{text}</span>
      </span>
    </div>
  );
};

// Spinner variant
export const BookingSpinner = ({ text = "Processing...", size = "sm", variant = "primary" }) => {
  const currentSize = SIZES[size] || SIZES.sm;
  
  const variants = {
    primary: 'border-current border-t-transparent',
    inverse: 'border-white/40 border-t-white',
    accent: 'border-gray-300 border-t-black'
  };

  return (
    <div className="flex items-center justify-center gap-4">
      <div className={`${currentSize.spinner} ${variants[variant] || variants.primary} rounded-full animate-spin drop-shadow-lg`}></div>
      <span className={`${currentSize.text} font-bold tracking-wider uppercase`}>
        {text}
      </span>
    </div>
  );
};

// Skeleton with shimmer effect
export const BookingSkeleton = ({ className = "" }) => {
  const SkeletonBar = ({ width }) => (
    <div className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-4 ${width} relative overflow-hidden`}>
      <ShimmerEffect />
    </div>
  );

  return (
    <div className={`relative overflow-hidden animate-pulse ${className}`}>
      {/* Image placeholder */}
      <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-56 w-full mb-6 relative overflow-hidden">
        <ShimmerEffect />
      </div>
      
      {/* Content placeholders */}
      <div className="space-y-4 px-2">
        <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-6 w-3/4 relative overflow-hidden">
          <ShimmerEffect />
        </div>
        <SkeletonBar width="w-full" />
        <SkeletonBar width="w-5/6" />
        
        {/* Info rows */}
        <div className="flex space-x-2 pt-2">
          <SkeletonBar width="w-1/3" />
          <SkeletonBar width="w-1/4" />
        </div>
        
        {/* Button placeholder */}
        <div className="bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 h-12 w-full mt-6 relative overflow-hidden">
          <ShimmerEffect />
        </div>
      </div>
    </div>
  );
};

// Full-screen loading
export const LoadingState = ({ 
  text = "Loading...", 
  type = "bounce", 
  size = "md",
  fullScreen = false 
}) => {
  const LoaderComponent = {
    bounce: BookingLoader,
    spin: BookingSpinner
  }[type] || BookingLoader;

  const content = (
    <div className="flex flex-col items-center justify-center space-y-8">
      <LoaderComponent text={text} size={size} />
      <div className="text-center max-w-md">
        <p className="text-sm text-gray-600 font-medium tracking-wide">
          Please wait while we process your request...
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div 
              key={i}
              className="w-1 h-1 bg-gray-400 rounded-full animate-ping" 
              style={{ animationDelay: `${i * 0.5}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return <div className="py-16 px-4">{content}</div>;
};

// Inline loader for buttons
export const InlineLoader = ({ size = "sm", variant = "dots" }) => {
  const currentSize = SIZES[size] || SIZES.sm;

  if (variant === 'spinner') {
    return (
      <div className={`${currentSize.dot} border border-current border-t-transparent rounded-full animate-spin`}></div>
    );
  }

  return <AnimatedDots size={size} count={3} />;
};

export default BookingLoader;