import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  createSingleVideo,
  createSingleVideoFromBase64,
  createMultipleVideosFromBase64,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  upload
} from '../controllers/video.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create single video (file upload)
router.post(
  '/single',
  upload.single('video'),
  createSingleVideo
);

// Create single video from base64
router.post(
  '/single/base64',
  createSingleVideoFromBase64
);

// Create multiple videos from base64
router.post(
  '/multiple/base64',
  createMultipleVideosFromBase64
);

// Get all videos (with pagination)
router.get(
  '/',
  getAllVideos
);

// Get single video by ID
router.get(
  '/:id',
  getVideoById
);

// Update video
router.put(
  '/:id',
  updateVideo
);

// Delete video
router.delete(
  '/:id',
  deleteVideo
);

export default router; 