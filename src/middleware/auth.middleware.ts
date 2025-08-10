import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { sendUnauthorized } from '../utils/response';

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    sendUnauthorized(res, 'Token missing');
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    (req as any).user = decoded;
    next();
  } catch (err) {
    sendUnauthorized(res, 'Invalid token');
  }
};
