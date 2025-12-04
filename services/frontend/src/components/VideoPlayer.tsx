import { useEffect, useRef } from 'react';
import type { VideoWithAnalytics } from '../types';
import { analyticsService } from '../services/analyticsService';

interface VideoPlayerProps {
  video: VideoWithAnalytics | null;
  onClose: () => void;
  onViewUpdate?: (videoId: string, newViews: number) => void;
}

export function VideoPlayer({ video, onClose, onViewUpdate }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const viewIncremented = useRef(false);

  useEffect(() => {
    if (video && !viewIncremented.current) {
      viewIncremented.current = true;
      analyticsService
        .incrementView(video.id)
        .then((response) => {
          onViewUpdate?.(video.id, response.views);
        })
        .catch((error) => {
          console.error('Failed to increment view:', error);
        });
    }

    return () => {
      viewIncremented.current = false;
    };
  }, [video, onViewUpdate]);

  if (!video) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{video.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Video */}
        <div className="relative bg-black">
          <video
            ref={videoRef}
            src={video.videoUrl}
            controls
            className="w-full h-auto max-h-[70vh]"
            autoPlay
          />
        </div>

        {/* Info */}
        <div className="p-4">
          {video.description && (
            <p className="text-gray-700 mb-3">{video.description}</p>
          )}
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
              <span>{video.views} views</span>
            </div>
            <div className="flex items-center gap-1">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{video.likes} likes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

