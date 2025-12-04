import { useState, useEffect } from 'react';
import { uploadService } from '../services/uploadService';
import { analyticsService } from '../services/analyticsService';
import { combineVideoWithAnalytics } from '../utils/videoUtils';
import type { Video, VideoWithAnalytics } from '../types';
import { VideoCard } from './VideoCard';
import { VideoPlayer } from './VideoPlayer';
import { UploadForm } from './UploadForm';
import { SkeletonCard } from './SkeletonCard';

type Tab = 'dashboard' | 'upload';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [videos, setVideos] = useState<VideoWithAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoWithAnalytics | null>(null);

  const fetchVideos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const videoList = await uploadService.getVideos();
      
      // Fetch analytics for each video
      const videosWithAnalytics = await Promise.all(
        videoList.map(async (video: Video) => {
          try {
            const analytics = await analyticsService.getAnalytics(video.id);
            return combineVideoWithAnalytics(video, analytics);
          } catch (err) {
            // If analytics not found, use defaults
            return combineVideoWithAnalytics(video, {
              views_count: 0,
              likes_count: 0,
            });
          }
        })
      );

      setVideos(videosWithAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    // Poll for updates every 10 seconds to catch status changes
    const interval = setInterval(fetchVideos, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLikeUpdate = (videoId: string, newLikes: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, likes: newLikes } : v))
    );
  };

  const handleViewUpdate = (videoId: string, newViews: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === videoId ? { ...v, views: newViews } : v))
    );
  };

  const handleUploadSuccess = () => {
    // Refresh videos after upload
    fetchVideos();
    // Switch to dashboard tab
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-bold text-gray-900">Video Analytics Dashboard</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload Video
            </button>
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'dashboard' ? (
          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Show skeleton cards matching the grid layout */}
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
                <button
                  onClick={fetchVideos}
                  className="ml-4 text-red-900 underline"
                >
                  Retry
                </button>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No videos found</p>
                <button
                  onClick={() => setActiveTab('upload')}
                  className="mt-4 text-blue-600 hover:text-blue-700 underline"
                >
                  Upload your first video
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={setSelectedVideo}
                    onLikeUpdate={handleLikeUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl">
            <UploadForm onUploadSuccess={handleUploadSuccess} />
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
          onViewUpdate={handleViewUpdate}
        />
      )}
    </div>
  );
}

