const BlackSkeletonLoader = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="p-6">
        {/* Header skeleton */}
        <div className="h-9 w-48 bg-black/10 rounded mb-6 animate-pulse"></div>
        
        {/* Search and date filter skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="h-12 bg-black/10 rounded-lg animate-pulse"></div>
          <div className="h-12 bg-black/10 rounded-lg animate-pulse"></div>
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-white border-2 border-black/20 rounded-lg overflow-hidden animate-pulse">
              {/* Image skeleton */}
              <div className="w-full h-48 bg-black/10"></div>
              
              <div className="p-4 space-y-3">
                {/* Title skeleton */}
                <div className="h-6 bg-black/10 rounded w-3/4"></div>
                
                {/* Description skeleton */}
                <div className="space-y-2">
                  <div className="h-4 bg-black/10 rounded w-full"></div>
                  <div className="h-4 bg-black/10 rounded w-2/3"></div>
                </div>
                
                {/* Trainer skeleton */}
                <div className="h-4 bg-black/10 rounded w-1/2"></div>
                
                {/* Schedule skeleton */}
                <div className="space-y-1">
                  <div className="h-4 bg-black/10 rounded w-1/3"></div>
                  <div className="h-4 bg-black/10 rounded w-2/3 ml-6"></div>
                </div>
                
                {/* Status skeleton */}
                <div className="h-4 bg-black/10 rounded w-1/4"></div>
                
                {/* Button skeleton */}
                <div className="h-10 bg-black/10 rounded-lg w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlackSkeletonLoader;