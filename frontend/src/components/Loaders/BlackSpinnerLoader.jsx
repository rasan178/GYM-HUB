// frontend/src/components/Loaders/BlackSkeletonLoader.jsx

import React from 'react';

const BlackSkeletonLoader = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="p-6">
        <div className="h-8 bg-gray-300 rounded mb-6 w-48 animate-pulse"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-300 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border-2 border-gray-300 rounded-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-300"></div>
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-full"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-10 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlackSkeletonLoader;