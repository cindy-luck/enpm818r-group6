import type { Video, VideoWithAnalytics } from '../types';
import { config } from '../config/env';

export function getVideoUrl(video: Video): string {
  if (!config.s3BucketName) {
    return `https://${video.s3_bucket_name}.s3.amazonaws.com/${video.s3_key_original}`;
  }
  return `https://${config.s3BucketName}.s3.amazonaws.com/${video.s3_key_original}`;
}

export function getThumbnailUrl(video: Video): string | null {
  if (!video.s3_key_thumbnail) {
    return null;
  }
  const bucket = config.s3BucketName || video.s3_bucket_name;
  return `https://${bucket}.s3.amazonaws.com/${video.s3_key_thumbnail}`;
}

export function combineVideoWithAnalytics(
  video: Video,
  analytics: { views_count: number; likes_count: number }
): VideoWithAnalytics {
  return {
    ...video,
    views: analytics.views_count,
    likes: analytics.likes_count,
    thumbnailUrl: getThumbnailUrl(video),
    videoUrl: getVideoUrl(video),
  };
}

