import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  createSingleImage,
  createSingleImageFromBase64,
  getAllImages,
  getImageById,
  updateImage,
  deleteImage,
  upload,
  getImageByTypeWise
} from '../controllers/image.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create single image (file upload)
router.post(
  '/single',
  upload.single('image'),
  createSingleImage
);


// Create single image from base64
router.post(
  '/single/base64',
  createSingleImageFromBase64
);

// Get all images (with pagination)
router.get(
  '/',
  getAllImages
);

router.post(
  '/single/types_wise',
  getImageByTypeWise
);

// Get single image by ID
router.get(
  '/:id',
  getImageById
);

// Update image
router.put(
  '/:id',
  updateImage
);

// Delete image
router.delete(
  '/:id',
  deleteImage
);

export default router; 