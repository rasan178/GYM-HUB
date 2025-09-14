const SkeletonLoader = ({ count = 3 }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="skeleton h-4 w-1/2"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonLoader;