import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model'; // Sequelize model
import { sendSuccess, sendUnauthorized } from '../utils/response';
import { Op, literal } from 'sequelize';
import { Role } from '../models/role.model';
import { maskEmail, maskPhone } from './auth.controller';
import Image from '../models/image.model';
import Video from '../models/video.model';
import Call from '../models/call.model';
import ChatMessage from '../models/chat.model';
import Room from '../models/room.model';

// === Zod schemas ===
const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const useSignIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = signInSchema.parse(req.body);

    let user = await User.findOne({ where: { email } });

    if (!user) {
      // Auto-signup flow
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        password: hashedPassword,
        // roleId: 1,
      });
    } else {
      // Existing user: validate password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        // return res.status(401).json({ message: 'Invalid credentials' });
        sendUnauthorized(res, 'Invalid credentials');
        return;
      }
    }

    // Generate JWT token
    // const token = jwt.sign(
    //   { userId: user },
    //   process.env.JWT_SECRET || 'default_secret',
    //   { expiresIn: '7d' }
    // );

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '7d' });


    // return res.status(200).json({
    //   message: 'Login successful',
    //   token,
    //   user: {
    //     id: user.id,
    //     email: user.email,
    //   },
    // });

    sendSuccess(res, { user, token }, 'Login successful');


  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }

    console.error('SignIn error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserDetailsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = z
      .object({
        user_id: z.coerce.number({
          required_error: 'user_id is required',
          invalid_type_error: 'user_id must be a number',
        }),
      })
      .parse(req.body);

    let user = await User.findOne({
      where: {
        id: user_id,
        roleId: { [Op.is]: null }
      },
      include: [{
        model: Role,
      }],

    });

    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    sendSuccess(res, user, 'User details retrieved successfully');

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }

    console.error('SignIn error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const hostListForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      where: { roleId: { [Op.eq]: 1 } },
      include: [{ model: Image }, { model: Role }],
      order: [
        ['is_popular', 'DESC'],
        [literal('popular_order IS NULL'), 'ASC'],
        ['popular_order', 'ASC'],
        ['id', 'DESC'],
      ],
    });

    const maskedUsers = users.map(user => {
      const userObj = user.toJSON();
      return {
        ...userObj,
        email: userObj.email ? maskEmail(userObj.email) : null,
        phone: userObj.phone ? maskPhone(userObj.phone) : null,
      };
    });

    sendSuccess(res, maskedUsers, 'Host details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const hostListPopularOnly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      where: { roleId: { [Op.eq]: 1 }, is_popular: { [Op.eq]: true } },
      include: [{ model: Image }, { model: Role }],
      order: [
        [literal('popular_order IS NULL'), 'ASC'],
        ['popular_order', 'ASC'],
        ['id', 'DESC'],
      ],
      limit: 50,
    });

    const maskedUsers = users.map(user => {
      const userObj = user.toJSON();
      return {
        ...userObj,
        email: (userObj as any).email ? maskEmail((userObj as any).email) : null,
        phone: (userObj as any).phone ? maskPhone((userObj as any).phone) : null,
      } as any;
    });

    sendSuccess(res, maskedUsers, 'Popular host list');
  } catch (err) {
    next(err);
  }
};


export const getAdminDetailsById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = z
      .object({
        user_id: z.coerce.number({
          required_error: 'user_id is required',
          invalid_type_error: 'user_id must be a number',
        }),
      })
      .parse(req.body);

    let user = await User.findOne({
      where: {
        id: user_id,
        roleId: { [Op.eq]: 1 }
      },
      include: [
        {
          model: Image,
        },
        {
          model: Video,
        },
        {
          model: Role,
        }
      ],

    });

    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    sendSuccess(res, user, 'User details retrieved successfully');

  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }

    console.error('SignIn error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getHostDetailsByIdForUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = (req.method === 'GET' ? req.query : req.body) as any;
    const idNum = Number(user_id);
    if (!idNum || Number.isNaN(idNum)) {
      return sendUnauthorized(res, 'user_id is required');
    }

    const user = await User.findOne({
      where: {
        id: idNum,
        roleId: { [Op.eq]: 1 }
      },
      include: [
        { model: Image },
        { model: Video },
        { model: Role },
      ],
    });

    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    const obj = user.toJSON() as any;
    const masked = {
      ...obj,
      email: obj.email ? maskEmail(obj.email) : null,
      phone: obj.phone ? maskPhone(obj.phone) : null,
    };
    sendSuccess(res, masked, 'Host details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const hostListForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      where: { roleId: { [Op.eq]: 1 } },
      include: [{ model: Image }, { model: Role }],
      order: [
        ['is_popular', 'DESC'],
        [literal('popular_order IS NULL'), 'ASC'],
        ['popular_order', 'ASC'],
        ['id', 'DESC'],
      ],
    });

    sendSuccess(res, users, 'Host details retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const setPopularHost = async (req: Request, res: Response) => {
  try {
    const { user_id, is_popular, popular_order } = req.body as { user_id: number; is_popular?: boolean; popular_order?: number | null };
    if (!user_id) return sendUnauthorized(res, 'user_id is required');
    const user = await User.findByPk(Number(user_id));
    if (!user) return sendUnauthorized(res, 'User not found');
    if (typeof is_popular === 'boolean') (user as any).is_popular = is_popular;
    if (popular_order === null || typeof popular_order === 'number') (user as any).popular_order = popular_order as any;
    await user.save();
    sendSuccess(res, user, 'Popular host updated');
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to update popular host' }); }
};

export const deleteHostThroughAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = z
      .object({
        user_id: z.coerce.number({
          required_error: 'user_id is required',
          invalid_type_error: 'user_id must be a number',
        }),
      })
      .parse(req.body);

    const user = await User.findByPk(user_id);
    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    await user.destroy();
    sendSuccess(res, null, 'User deleted successfully');
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }
    console.error('Delete Host error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const approveHostThroughAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = z
      .object({
        user_id: z.coerce.number({
          required_error: 'user_id is required',
          invalid_type_error: 'user_id must be a number',
        }),
      })
      .parse(req.body);

    const user = await User.findByPk(user_id);
    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    user.is_verified = true as any;
    (user as any).approval_status = 'approved';
    await user.save();

    sendSuccess(res, user, 'Host approved successfully');
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }
    console.error('Approve Host error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const rejectHostThroughAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = z
      .object({
        user_id: z.coerce.number({
          required_error: 'user_id is required',
          invalid_type_error: 'user_id must be a number',
        }),
      })
      .parse(req.body);

    const user = await User.findByPk(user_id);
    if (!user) {
      return sendUnauthorized(res, 'User not found');
    }

    user.is_verified = false as any;
    (user as any).approval_status = 'rejected';
    await user.save();

    sendSuccess(res, user, 'Host rejected successfully');
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation failed', errors: err.errors });
    }
    console.error('Reject Host error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const userListForHost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      where: { roleId: { [Op.is]: null } },
      include: [{ model: Image }],
      order: [[Image, 'id', 'DESC']]
    });

    const maskedUsers = users.map((u) => {
      const obj = u.toJSON() as any;
      return {
        ...obj,
        email: obj.email ? maskEmail(obj.email) : null,
        phone: obj.phone ? maskPhone(obj.phone) : null,
      };
    });

    sendSuccess(res, maskedUsers, 'User list for host retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createCallLog = async (req: Request, res: Response) => {
  try {
    const { sender_id, receiver_id, roomName, startedAt } = req.body;
    const call = await Call.create({ sender_id, receiver_id, roomName, startedAt: startedAt ? new Date(startedAt) : new Date(), status: 'ringing' });
    sendSuccess(res, call, 'Call created');
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to create call' }); }
};

export const updateCallStatus = async (req: Request, res: Response) => {
  try {
    const { id, status, answeredAt, endedAt, durationSeconds } = req.body;
    const call = await Call.findByPk(id);
    if (!call) return sendUnauthorized(res, 'Call not found');
    if (status) (call as any).status = status;
    if (answeredAt) (call as any).answeredAt = new Date(answeredAt);
    if (endedAt) (call as any).endedAt = new Date(endedAt);
    if (typeof durationSeconds === 'number') (call as any).durationSeconds = durationSeconds;
    await call.save();
    sendSuccess(res, call, 'Call updated');
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to update call' }); }
};

export const listChatMessages = async (req: Request, res: Response) => {
  try {
    const { roomName, limit = 50, before } = req.query as any;
    if (!roomName) return sendUnauthorized(res, 'roomName is required');
    const where: any = { roomName };
    if (before) where.createdAt = { ['lt' as any]: new Date(before) };
    const messages = await ChatMessage.findAll({ where, order: [['createdAt', 'DESC']], limit: Number(limit) });
    sendSuccess(res, messages.reverse(), 'Messages');
  } catch (e) { res.status(500).json({ success: false, message: 'Failed to list messages' }); }
};

export const createChatMessage = async (req: Request, res: Response) => {
  try {
    const { roomName, senderId, message } = req.body;
    if (!roomName || !message) return sendUnauthorized(res, 'roomName and message are required');
    
    // Get user ID from the authenticated request
    const userId = (req as any).user?.id || senderId;
    
    const saved = await ChatMessage.create({ 
      roomName, 
      senderId: senderId ? Number(senderId) : null, 
      message,
      created_by: userId || 0,
      updated_by: userId || 0
    });
    sendSuccess(res, saved, 'Saved');
  } catch (e) { 
    console.error('Error creating chat message:', e);
    res.status(500).json({ success: false, message: 'Failed to save message' }); 
  }
};

export const createRoom = async (req: Request, res: Response) => {
  try {
    const { sender_id, receiver_id } = req.body as any;
    if (!sender_id || !receiver_id) {
      return sendUnauthorized(res, 'sender_id and receiver_id are required');
    }
    console.log("sender_id",sender_id);
    console.log("receiver_id",receiver_id);
    
    // Get user ID from the authenticated request
    const userId = (req as any).user?.id || sender_id;
    
    // Reuse any existing room for this pair in either order
    const a = Math.min(Number(sender_id), Number(receiver_id));
    const b = Math.max(Number(sender_id), Number(receiver_id));
    const normalizedName = `room_${a}_${b}`;
    let room = await Room.findOne({ where: { [Op.or]: [
      { sender_id: a, receiver_id: b },
      { sender_id: b, receiver_id: a },
      { name: normalizedName },
    ] } as any });
    if (!room) {
      room = await Room.create({ 
        name: normalizedName, 
        sender_id: sender_id, 
        receiver_id: receiver_id,
        created_by: userId || 0,
        updated_by: userId || 0
      });
    }
    sendSuccess(res, room, 'Room ready');
  } catch (e) { 
    console.error('Error creating room:', e);
    res.status(500).json({ success: false, message: 'Failed to create room' }); 
  }
};

