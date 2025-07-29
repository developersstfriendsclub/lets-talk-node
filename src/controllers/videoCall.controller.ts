import { Request, Response } from 'express';
import { generateAgoraToken } from '../utils/generateToken';
import { number } from 'zod';

export const generateTokenController = (req: Request, res: Response) => {
  const { channelName, uid } = req.query;
  if (!channelName || !uid) {
    return res.status(400).json({ success: false, message: 'channelName and uid are required' });
  }
  try {
    const token = generateAgoraToken(channelName as string, Number(uid));
    if (!token) {
      return res.status(500).json({ success: false, message: 'Failed to generate token' });
    }
    return res.json({
      success: true,
      data: {
        appID: process.env.AGORA_APP_ID,
        channelName,
        token,
        uid
      },
      message: 'Token generated successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}; 