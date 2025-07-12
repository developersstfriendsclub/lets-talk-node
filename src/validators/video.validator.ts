import { z } from 'zod';

// Create single video input
export const CreateSingleVideoInput = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

// Create single video from base64 input
export const CreateSingleVideoFromBase64Input = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  base64Data: z.string().min(1, 'Base64 data is required'),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

// Create multiple videos from base64 input
export const CreateMultipleVideosFromBase64Input = z.object({
  videos: z.array(z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    isPublic: z.boolean().optional().default(false),
    base64Data: z.string().min(1, 'Base64 data is required'),
    fileName: z.string().optional(),
    mimeType: z.string().optional(),
  })).min(1, 'At least one video is required').max(5, 'Maximum 5 videos allowed'),
});

// Update video input
export const UpdateVideoInput = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
  status: z.enum(['processing', 'completed', 'failed']).optional(),
});

// Get video by ID input
export const GetVideoByIdInput = z.object({
  id: z.string().min(1, 'Video ID is required'),
});

// Get all videos input
export const GetAllVideosInput = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isPublic: z.string().optional(),
  status: z.string().optional(),
}); 