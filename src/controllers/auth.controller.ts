import { Request, Response } from 'express';
import { User } from '../models/user.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAgoraToken } from '../utils/generateToken';

export const signUp = async (req: Request, res: Response) => {
  try {
    const { email, password , name , gender , phone , dob ,  } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create(
      { email, password: hashed , name , gender , phone , dob ,  });
    res.status(201).json({ message: 'User created', user });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

export const signIn = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(400).json({ message: 'Invalid credentials 111' });
  // res.json({ user });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials 2222' });

  const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
  res.json({ token });
};

export const generateVideoCallToken = async (req: Request, res: Response) => {
  const channelName = req.query.channelName as string;
  const uid = parseInt(req.query.uid as string) || 0;

  if (!channelName) {
    return res.status(400).json({ error: 'channelName is required' });
  }

  try {
    const token = generateAgoraToken(channelName, uid);
    return res.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return res.status(500).json({ error: 'Failed to generate token' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  res.json({ message: `Password reset link sent to ${email}` });
};




export const dashboard = async (req: Request, res: Response) => {
  res.json({ message: `Welcome ${(req as any).user.email}` });
};
