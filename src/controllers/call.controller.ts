import { Request, Response } from 'express';
import Call, { CallStatus, CallType } from '../models/call.model';
import { sendSuccess, sendError, sendNotFound, sendValidationError } from '../utils/response';
import { Op } from 'sequelize';
import { sequelize } from '../config/database';

// Create a new call
export const createCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { receiver_id, roomName, callType = 'video' } = req.body;

    if (!receiver_id || !roomName) {
      sendValidationError(res, 'Receiver ID and room name are required');
      return;
    }

    const call = await Call.create({
      sender_id: userId,
      receiver_id,
      roomName,
      status: 'ringing',
      callType,
      startedAt: new Date(),
      created_by: userId,
      updated_by: userId
    });

    sendSuccess(res, call, 'Call created successfully');
  } catch (error) {
    sendError(res, 'Failed to create call', 500, error);
  }
};

// Update call status
export const updateCallStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { status, durationSeconds } = req.body;

    if (!status) {
      sendValidationError(res, 'Status is required');
      return;
    }

    const call = await Call.findOne({
      where: {
        id: parseInt(id),
        is_active: true
      }
    });

    if (!call) {
      sendNotFound(res, 'Call not found');
      return;
    }

    // Verify user is part of this call
    if (call.sender_id !== userId && call.receiver_id !== userId) {
      sendError(res, 'Unauthorized to update this call', 403);
      return;
    }

    const updateData: any = { status, updated_by: userId };

    if (status === 'accepted') {
      updateData.answeredAt = new Date();
    } else if (status === 'ended' || status === 'missed' || status === 'rejected') {
      updateData.endedAt = new Date();
      if (durationSeconds) {
        updateData.durationSeconds = durationSeconds;
      }
    }

    await call.update(updateData);

    sendSuccess(res, call, 'Call status updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update call status', 500, error);
  }
};

// Get call history for a user
export const getUserCallHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const callType = req.query.callType as string;

    const offset = (page - 1) * limit;
    const whereClause: any = {
      is_active: true,
      [Op.or]: [
        { sender_id: userId },
        { receiver_id: userId }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    if (callType) {
      whereClause.callType = callType;
    }

    const { count, rows } = await Call.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      attributes: [
        'id', 'roomName', 'status', 'callType', 'startedAt', 
        'answeredAt', 'endedAt', 'durationSeconds', 'createdAt'
      ]
    });

    const totalPages = Math.ceil(count / limit);

    sendSuccess(res, {
      calls: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit
      }
    }, 'Call history retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve call history', 500, error);
  }
};

// Get call statistics for a user
export const getUserCallStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { period = '30' } = req.query; // days

    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period as string));

    const stats = await Call.findAll({
      where: {
        is_active: true,
        createdAt: {
          [Op.gte]: daysAgo
        },
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      attributes: [
        'status',
        'callType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('durationSeconds')), 'totalDuration']
      ],
      group: ['status', 'callType'],
      raw: true
    });

    const totalCalls = stats.reduce((sum, stat: any) => sum + parseInt(stat.count as string), 0);
    const totalDuration = stats.reduce((sum, stat: any) => sum + (parseInt(stat.totalDuration as string) || 0), 0);

    sendSuccess(res, {
      stats,
      summary: {
        totalCalls,
        totalDuration,
        period: `${period} days`
      }
    }, 'Call statistics retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve call statistics', 500, error);
  }
};

// End an active call
export const endCall = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { roomName } = req.params;
    const { durationSeconds } = req.body;

    const call = await Call.findOne({
      where: {
        roomName,
        status: 'accepted',
        is_active: true,
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      }
    });

    if (!call) {
      sendNotFound(res, 'Active call not found');
      return;
    }

    await call.update({
      status: 'ended',
      endedAt: new Date(),
      durationSeconds: durationSeconds || 0,
      updated_by: userId
    });

    sendSuccess(res, call, 'Call ended successfully');
  } catch (error) {
    sendError(res, 'Failed to end call', 500, error);
  }
};
