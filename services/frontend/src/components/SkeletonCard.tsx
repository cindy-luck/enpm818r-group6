export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Thumbnail skeleton with shimmer */}
      <div className="aspect-video bg-gray-200 animate-shimmer"></div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4 animate-shimmer"></div>

        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-100 rounded w-full animate-shimmer"></div>
          <div className="h-4 bg-gray-100 rounded w-5/6 animate-shimmer"></div>
        </div>

        {/* Stats skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 bg-gray-200 rounded w-16 animate-shimmer"></div>
          <div className="h-8 bg-gray-200 rounded-full w-20 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
}

