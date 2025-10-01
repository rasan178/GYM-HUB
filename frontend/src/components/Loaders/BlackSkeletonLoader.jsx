const BlackSkeletonLoader = ({ lines = 4 }) => {
  const items = Array.from({ length: lines });
  return (
    <div className="space-y-3">
      {items.map((_, idx) => (
        <div key={idx} className="h-4 bg-black/10 animate-pulse" />
      ))}
    </div>
  );
};

export default BlackSkeletonLoader;