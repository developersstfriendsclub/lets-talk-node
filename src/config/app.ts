import dotenv from 'dotenv';
dotenv.config();

export const appConfig = {
  // Base URL for file uploads - can be overridden by environment variable
  baseUrl: process.env.BASE_URL || 'http://clientfriendclub.com',
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Server port
  port: process.env.PORT || 5000,
  
  // Upload paths
  uploadPaths: {
    images: '/uploads/images',
    videos: '/uploads/videos'
  }
};

// Helper function to generate file URLs
export const generateFileUrl = (filename: string, type: 'image' | 'video' = 'image'): string => {
  const uploadPath = type === 'image' ? appConfig.uploadPaths.images : appConfig.uploadPaths.videos;
  return `${appConfig.baseUrl}${uploadPath}/${filename}`;
};
