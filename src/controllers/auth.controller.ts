import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAgoraToken } from '../utils/generateToken';
import { sendSuccess, sendError, sendValidationError, sendUnauthorized } from '../utils/response';

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password , name , gender , phone , dob ,  } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create(
      { email, password: hashed , name , gender , phone , dob ,  });
    sendSuccess(res, { user }, 'User created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      sendUnauthorized(res, 'Invalid credentials');
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      sendUnauthorized(res, 'Invalid credentials');
      return;
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    sendSuccess(res, { token }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

export const generateVideoCallToken = async (req: Request, res: Response, next: NextFunction) => {
  const channelName = req.query.channelName as string;
  const uid = parseInt(req.query.uid as string) || 0;

  if (!channelName) {
    sendValidationError(res, 'channelName is required');
    return;
  }

  try {
    const token = generateAgoraToken(channelName, uid);
    sendSuccess(res, { token }, 'Video call token generated successfully');
  } catch (error) {
    console.error('Token generation error:', error);
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    sendSuccess(res, { email }, `Password reset link sent to ${email}`);
  } catch (err) {
    next(err);
  }
};




export const getHostDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll();
    sendSuccess(res, { users }, 'Host details retrieved successfully');
  } catch (err) {
    next(err);
  }
};
