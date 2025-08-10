import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import { sendSuccess, sendNotFound, sendUnauthorized, sendValidationError } from '../utils/response';

// Get user interests
export const getUserInterests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle both JWT payload structures
    const userId = (req as any).user?.id || (req as any).user?.userId?.id;
    if (!userId) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'interests', 'sports', 'film', 'music', 'travelling', 'food']
    });

    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }

    sendSuccess(res, {
      interests: (user as any).interests || [],
      sports: (user as any).sports || [],
      film: (user as any).film || [],
      music: (user as any).music || [],
      travelling: (user as any).travelling || [],
      food: (user as any).food || []
    }, 'User interests retrieved successfully');
  } catch (err) {
    next(err);
  }
};

// Update user interests
export const updateUserInterests = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Handle both JWT payload structures
    const userId = (req as any).user?.id || (req as any).user?.id;
    if (!userId) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }

    const { interests, sports, film, music, travelling, food } = req.body;

    // Validate that at least one interest is provided
    if (!interests || !Array.isArray(interests) || interests.length === 0) {
      sendValidationError(res, 'At least one interest is required');
      return;
    }

    // Validate interests array length (max 5 as per frontend)
    if (interests.length > 5) {
      sendValidationError(res, 'Maximum 5 interests allowed');
      return;
    }

    // Validate that all interests are strings
    if (!interests.every(interest => typeof interest === 'string')) {
      sendValidationError(res, 'All interests must be strings');
      return;
    }

    const updateFields: any = { interests };

    // Add other optional fields if provided
    if (sports && Array.isArray(sports)) updateFields.sports = sports;
    if (film && Array.isArray(film)) updateFields.film = film;
    if (music && Array.isArray(music)) updateFields.music = music;
    if (travelling && Array.isArray(travelling)) updateFields.travelling = travelling;
    if (food && Array.isArray(food)) updateFields.food = food;

    const [updated] = await User.update(updateFields, { where: { id: userId } });

    if (!updated) {
      sendNotFound(res, 'User not found');
      return;
    }

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'interests', 'sports', 'film', 'music', 'travelling', 'food']
    });

    sendSuccess(res, updatedUser, 'Interests updated successfully');
  } catch (err) {
    next(err);
  }
};
