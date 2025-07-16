import { Request, Response } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import Image from '../models/image.model';
import { sendSuccess, sendError, sendNotFound, sendValidationError } from '../utils/response';

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req: any, file: any, cb: any) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit
  }
});

// Create single image (file upload)
export const createSingleImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { title, description, isPublic } = req.body;
    
    if (!req.file) {
      sendValidationError(res, 'Image file is required');
      return;
    }

    const file = req.file;
    const imagePath = file.path;
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${file.filename}`;

    // Get image dimensions
    const imageInfo = await sharp(imagePath).metadata();

    const image = await Image.create({
      userId,
      title,
      description,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: imagePath,
      url: imageUrl,
      width: imageInfo.width,
      height: imageInfo.height,
      isPublic: isPublic || false,
    });

    sendSuccess(res, image, 'Image uploaded successfully');
  } catch (error) {
    sendError(res, 'Failed to upload image', 500, error);
  }
};

// Create single image from base64
export const createSingleImageFromBase64 = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { title, description, isPublic, base64Data, fileName, mimeType } = req.body;
    
    if (!base64Data) {
      sendValidationError(res, 'Base64 image data is required');
      return;
    }

    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}.jpg`;
    const imagePath = `uploads/images/${uniqueName}`;
    
    // Ensure upload directory exists
    const uploadDir = 'uploads/images';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convert base64 to buffer and save
    const imageBuffer = Buffer.from(base64Image, 'base64');
    fs.writeFileSync(imagePath, imageBuffer);

    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/images/${uniqueName}`;

    // Get image dimensions
    const imageInfo = await sharp(imageBuffer).metadata();

    const image = await Image.create({
      userId,
      title,
      description,
      filename: uniqueName,
      originalName: fileName || 'base64-image.jpg',
      mimeType: mimeType || 'image/jpeg',
      size: imageBuffer.length,
      path: imagePath,
      url: imageUrl,
      width: imageInfo.width,
      height: imageInfo.height,
      isPublic: isPublic || false,
    });

    sendSuccess(res, image, 'Base64 image uploaded successfully');
  } catch (error) {
    sendError(res, 'Failed to upload base64 image', 500, error);
  }
};

// Get all images (with pagination)
export const getAllImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const page = req.query.page as string || '1';
    const limit = req.query.limit as string || '10';
    const isPublic = req.query.isPublic as string;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { userId };
    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic === 'true';
    }

    const { count, rows } = await Image.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    sendSuccess(res, {
      images: rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
      }
    }, 'Images retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve images', 500, error);
  }
};

// Get single image by ID
export const getImageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const image = await Image.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!image) {
      sendNotFound(res, 'Image not found');
      return;
    }

    sendSuccess(res, image, 'Image retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve image', 500, error);
  }
};

// Update image
export const updateImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    const image = await Image.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!image) {
      sendNotFound(res, 'Image not found');
      return;
    }

    await image.update(updateData);

    sendSuccess(res, image, 'Image updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update image', 500, error);
  }
};

// Delete image
export const deleteImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const image = await Image.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!image) {
      sendNotFound(res, 'Image not found');
      return;
    }

    // Delete file from filesystem
    if (fs.existsSync(image.path)) {
      fs.unlinkSync(image.path);
    }

    await image.destroy();

    sendSuccess(res, null, 'Image deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete image', 500, error);
  }
}; 