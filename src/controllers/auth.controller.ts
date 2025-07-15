import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAgoraToken } from '../utils/generateToken';
import { sendSuccess, sendError, sendValidationError, sendUnauthorized, sendNotFound } from '../utils/response';

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password , name , gender , phone , dob ,  } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create(
      { email, password: hashed , name , gender , phone , dob ,  });
    sendSuccess(res,  user , 'User created successfully', 201);
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

export const getAgoraToken = (req: Request, res: Response) => {
  const { channelName, uid } = req.query;
  if (!channelName || !uid) {
    return res.status(400).json({ error: 'channelName and uid are required' });
  }
  try {
    const token = generateAgoraToken(channelName as string, Number(uid));
    res.json({ data: { token } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
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

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }
    const updateFields = (({
      name, gender, phone, dob, interests, sports, film, music, travelling, food, image
    }) => ({ name, gender, phone, dob, interests, sports, film, music, travelling, food, image }))(req.body);
    const [updated] = await User.update(updateFields, { where: { id: userId } });
    if (!updated) {
      sendNotFound(res, 'User not found');
      return;
    }
    const updatedUser = await User.findByPk(userId);
    sendSuccess(res, updatedUser, 'User updated successfully');
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      sendUnauthorized(res, 'User not authenticated');
      return;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }
    sendSuccess(res, user, 'User details retrieved successfully');
  } catch (err) {
    next(err);
  }
};




export const getHostDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll();
    sendSuccess(res, users , 'Host details retrieved successfully');
  } catch (err) {
    next(err);
  }
};
