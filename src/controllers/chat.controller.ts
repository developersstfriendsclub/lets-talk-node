import { Request, Response } from 'express';
import { Op } from 'sequelize';
import ChatMessage from '../models/chat.model';
import { sequelize } from '../config/database';
import { sendSuccess, sendError, sendNotFound, sendValidationError } from '../utils/response';

// Create a new chat message
export const createChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { roomName, message, messageType = 'text' } = req.body;

    if (!roomName || !message) {
      sendValidationError(res, 'Room name and message are required');
      return;
    }

    const chatMessage = await ChatMessage.create({
      roomName,
      senderId: userId,
      message,
      messageType,
      created_by: userId,
      updated_by: userId
    });

    sendSuccess(res, chatMessage, 'Chat message created successfully');
  } catch (error) {
    sendError(res, 'Failed to create chat message', 500, error);
  }
};

// Get chat history for a specific room
export const getChatHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { roomName } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!roomName) {
      sendValidationError(res, 'Room name is required');
      return;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await ChatMessage.findAndCountAll({
      where: {
        roomName,
        is_active: true
      },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'message', 'messageType', 'senderId', 'createdAt']
    });

    const totalPages = Math.ceil(count / limit);

    sendSuccess(res, {
      messages: rows.reverse(), // Show oldest first
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    }, 'Chat history retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve chat history', 500, error);
  }
};

// Get chat rooms for a user
export const getUserChatRooms = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const chatRooms = await ChatMessage.findAll({
      where: {
        is_active: true
      },
      attributes: [
        'roomName',
        [sequelize.fn('MAX', sequelize.col('createdAt')), 'lastMessageAt'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'messageCount']
      ],
      group: ['roomName'],
      order: [[sequelize.fn('MAX', sequelize.col('createdAt')), 'DESC']],
      raw: true
    });

    sendSuccess(res, chatRooms, 'Chat rooms retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve chat rooms', 500, error);
  }
};

// Delete a chat message (soft delete)
export const deleteChatMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const chatMessage = await ChatMessage.findOne({
      where: {
        id: parseInt(id),
        senderId: userId,
        is_active: true
      }
    });

    if (!chatMessage) {
      sendNotFound(res, 'Chat message not found');
      return;
    }

    await chatMessage.update({
      is_active: false,
      updated_by: userId
    });

    sendSuccess(res, null, 'Chat message deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete chat message', 500, error);
  }
};

// Search chat messages
export const searchChatMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { query, roomName } = req.query;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    if (!query) {
      sendValidationError(res, 'Search query is required');
      return;
    }

    const offset = (page - 1) * limit;
    const whereClause: any = {
      message: {
        [Op.iLike]: `%${query}%`
      },
      is_active: true
    };

    if (roomName) {
      whereClause.roomName = roomName;
    }

    const { count, rows } = await ChatMessage.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: ['id', 'message', 'messageType', 'senderId', 'roomName', 'createdAt']
    });

    const totalPages = Math.ceil(count / limit);

    sendSuccess(res, {
      messages: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    }, 'Search completed successfully');
  } catch (error) {
    sendError(res, 'Failed to search chat messages', 500, error);
  }
};
