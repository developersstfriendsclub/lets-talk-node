import { z } from 'zod';

// Create single image input
export const CreateSingleImageInput = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
});

// Create single image from base64 input
export const CreateSingleImageFromBase64Input = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  isPublic: z.boolean().optional().default(false),
  base64Data: z.string().min(1, 'Base64 data is required'),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

// Update image input
export const UpdateImageInput = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

// Get image by ID input
export const GetImageByIdInput = z.object({
  id: z.string().min(1, 'Image ID is required'),
});

// Get all images input
export const GetAllImagesInput = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isPublic: z.string().optional(),
}); 