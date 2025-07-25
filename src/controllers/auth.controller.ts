import { Request, Response, NextFunction } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAgoraToken } from '../utils/generateToken';
import { sendSuccess, sendError, sendValidationError, sendUnauthorized, sendNotFound } from '../utils/response';
import Image from '../models/image.model';

// Helper functions for masking
function maskEmail(email: string): string {
  if (!email) return '';
  const [user, domain] = email.split('@');
  if (user.length <= 5) return '*'.repeat(user.length) + '@' + domain;
  return '*'.repeat(5) + user.slice(5) + '@' + domain;
}

function maskPhone(phone: string): string {
  if (!phone) return '';
  // Remove non-digits for masking, but keep original format
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(digits.length);
  return digits.slice(0, digits.length - 4) + '****';
}

function maskName(name: string): string {
  if (!name) return '';
  if (name.length <= 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password , name , gender , phone , dob } = req.body;
    // Check for duplicate email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, 'User with this email already exists', 409);
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create(
      { email, password: hashed , name , gender , phone , dob });
    // Mask sensitive fields in response
    const userObj = user.toJSON();
    const maskedUser = {
      ...userObj,
      email: maskEmail(userObj.email),
      phone: maskPhone(userObj.phone),
      name: maskName(userObj.name)
    };
    sendSuccess(res,  maskedUser , 'User created successfully', 201);
  } catch (err) {
    // Log the full error object for debugging
    console.error('SignUp Error:', err);
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
  // const channelName = req.query.channelName as string;
  const uid = parseInt(req.query.uid as string) || 0;

  // if (!channelName) {
  //   sendValidationError(res, 'channelName is required');
  //   return;
  // }

  try {
    const token = generateAgoraToken(uid);
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
    const user = await User.findOne({
      where:{
        id:userId
      },
      include:[
        {
          model:Image,
          order: [['id', 'DESC']]
        }
      ]
    });
    if (!user) {
      sendNotFound(res, 'User not found');
      return;
    }
    // Mask sensitive fields in response
    const userObj = user.toJSON();
    const maskedUser = {
      ...userObj,
      email: maskEmail(userObj.email),
      phone: maskPhone(userObj.phone),
      name: maskName(userObj.name)
    };
    sendSuccess(res, maskedUser, 'User details retrieved successfully');
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
