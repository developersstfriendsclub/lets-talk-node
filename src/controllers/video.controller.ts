import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import Video from '../models/video.model';
import { sendSuccess, sendError, sendNotFound, sendValidationError } from '../utils/response';

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: any) => {
    const uploadDir = 'uploads/videos';
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
  const allowedMimes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, AVI, MOV, WMV, FLV, and WebM videos are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

// Create single video (file upload)
export const createSingleVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { title, description, isPublic } = req.body;
    
    if (!req.file) {
      sendValidationError(res, 'Video file is required');
      return;
    }

    const file = req.file;
    const videoPath = file.path;
    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${file.filename}`;

    const video = await Video.create({
      userId,
      title,
      description,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: videoPath,
      url: videoUrl,
      isPublic: isPublic || false,
      status: 'processing',
    });

    // In a real application, you would process the video asynchronously
    // For now, we'll mark it as completed immediately
    await video.update({ status: 'completed' });

    sendSuccess(res, video, 'Video uploaded successfully');
  } catch (error) {
    sendError(res, 'Failed to upload video', 500, error);
  }
};

// Create single video from base64
export const createSingleVideoFromBase64 = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { title, description, isPublic, base64Data, fileName, mimeType } = req.body;
    
    if (!base64Data) {
      sendValidationError(res, 'Base64 video data is required');
      return;
    }

    // Remove data URL prefix if present
    const base64Video = base64Data.replace(/^data:video\/[a-z]+;base64,/, '');
    
    // Generate unique filename
    const uniqueName = `${uuidv4()}-${Date.now()}.mp4`;
    const videoPath = `uploads/videos/${uniqueName}`;
    
    // Ensure upload directory exists
    const uploadDir = 'uploads/videos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Convert base64 to buffer and save
    const videoBuffer = Buffer.from(base64Video, 'base64');
    fs.writeFileSync(videoPath, videoBuffer);

    const videoUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${uniqueName}`;

    const video = await Video.create({
      userId,
      title,
      description,
      filename: uniqueName,
      originalName: fileName || 'base64-video.mp4',
      mimeType: mimeType || 'video/mp4',
      size: videoBuffer.length,
      path: videoPath,
      url: videoUrl,
      isPublic: isPublic || false,
      status: 'processing',
    });

    // In a real application, you would process the video asynchronously
    // For now, we'll mark it as completed immediately
    await video.update({ status: 'completed' });

    sendSuccess(res, video, 'Base64 video uploaded successfully');
  } catch (error) {
    sendError(res, 'Failed to upload base64 video', 500, error);
  }
};

// Create multiple videos from base64
export const createMultipleVideosFromBase64 = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { videos } = req.body;
    
    if (!videos || !Array.isArray(videos) || videos.length === 0) {
      sendValidationError(res, 'At least one base64 video is required');
      return;
    }

    if (videos.length > 5) {
      sendValidationError(res, 'Maximum 5 videos allowed per request');
      return;
    }

    const uploadedVideos = [];

    for (const videoData of videos) {
      const { title, description, isPublic, base64Data, fileName, mimeType } = videoData;
      
      if (!title || !base64Data) {
        continue;
      }

      // Remove data URL prefix if present
      const base64Video = base64Data.replace(/^data:video\/[a-z]+;base64,/, '');
      
      // Generate unique filename
      const uniqueName = `${uuidv4()}-${Date.now()}.mp4`;
      const videoPath = `uploads/videos/${uniqueName}`;
      
      // Ensure upload directory exists
      const uploadDir = 'uploads/videos';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Convert base64 to buffer and save
      const videoBuffer = Buffer.from(base64Video, 'base64');
      fs.writeFileSync(videoPath, videoBuffer);

      const videoUrl = `${req.protocol}://${req.get('host')}/uploads/videos/${uniqueName}`;

      const video = await Video.create({
        userId,
        title,
        description,
        filename: uniqueName,
        originalName: fileName || 'base64-video.mp4',
        mimeType: mimeType || 'video/mp4',
        size: videoBuffer.length,
        path: videoPath,
        url: videoUrl,
        isPublic: isPublic || false,
        status: 'processing',
      });

      // In a real application, you would process the video asynchronously
      // For now, we'll mark it as completed immediately
      await video.update({ status: 'completed' });

      uploadedVideos.push(video);
    }

    sendSuccess(res, uploadedVideos, `${uploadedVideos.length} base64 videos uploaded successfully`);
  } catch (error) {
    sendError(res, 'Failed to upload base64 videos', 500, error);
  }
};

// Get all videos (with pagination)
export const getAllVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const page = req.query.page as string || '1';
    const limit = req.query.limit as string || '10';
    const isPublic = req.query.isPublic as string;
    const status = req.query.status as string;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { userId };
    if (isPublic !== undefined) {
      whereClause.isPublic = isPublic === 'true';
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows } = await Video.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    sendSuccess(res, {
      videos: rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
      }
    }, 'Videos retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve videos', 500, error);
  }
};

// Get single video by ID
export const getVideoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const video = await Video.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!video) {
      sendNotFound(res, 'Video not found');
      return;
    }

    sendSuccess(res, video, 'Video retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve video', 500, error);
  }
};

// Update video
export const updateVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    const video = await Video.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!video) {
      sendNotFound(res, 'Video not found');
      return;
    }

    await video.update(updateData);

    sendSuccess(res, video, 'Video updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update video', 500, error);
  }
};

// Delete video
export const deleteVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const video = await Video.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!video) {
      sendNotFound(res, 'Video not found');
      return;
    }

    // Delete file from filesystem
    if (fs.existsSync(video.path)) {
      fs.unlinkSync(video.path);
    }

    // Delete thumbnail if exists
    if (video.thumbnailPath && fs.existsSync(video.thumbnailPath)) {
      fs.unlinkSync(video.thumbnailPath);
    }

    await video.destroy();

    sendSuccess(res, null, 'Video deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete video', 500, error);
  }
}; 