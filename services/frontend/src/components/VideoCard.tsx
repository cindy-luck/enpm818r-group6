import { useState } from 'react';
import type { VideoWithAnalytics } from '../types';
import { analyticsService } from '../services/analyticsService';

interface VideoCardProps {
  video: VideoWithAnalytics;
  onPlay: (video: VideoWithAnalytics) => void;
  onLikeUpdate?: (videoId: string, newLikes: number) => void;
}

export function VideoCard({ video, onPlay, onLikeUpdate }: VideoCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [localLikes, setLocalLikes] = useState(video.likes);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiking) return;

    setIsLiking(true);
    // Optimistic update
    const optimisticLikes = localLikes + 1;
    setLocalLikes(optimisticLikes);

    try {
      const response = await analyticsService.likeVideo(video.id);
      setLocalLikes(response.likes);
      onLikeUpdate?.(video.id, response.likes);
    } catch (error) {
      // Revert on error
      setLocalLikes(video.likes);
      console.error('Failed to like video:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleClick = () => {
    onPlay(video);
  };

  const isLoading = video.status === 'PENDING' || video.status === 'PROCESSING';
  const isFailed = video.status === 'FAILED';

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer group"
      onClick={handleClick}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-200 flex items-center justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">{video.status}</p>
          </div>
        ) : isFailed ? (
          <div className="flex flex-col items-center gap-2 text-red-500">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">Processing Failed</p>
          </div>
        ) : video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {/* Play overlay */}
        {!isLoading && !isFailed && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform">
              <svg
                className="w-8 h-8 text-blue-600 ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {video.description}
          </p>
        )}

        {/* Stats and Like Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{video.views}</span>
            </div>
          </div>

          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <svg
              className={`w-5 h-5 ${localLikes > video.likes ? 'text-red-500' : 'text-gray-600'}`}
              fill={localLikes > video.likes ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span className="text-sm font-medium">{localLikes}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

