import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model'; // Sequelize model
import { sendSuccess, sendUnauthorized } from '../utils/response';
import { Op } from 'sequelize';
import { Role } from '../models/role.model';
import { maskEmail, maskPhone } from './auth.controller';
import Image from '../models/image.model';

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
    const token = jwt.sign(
      { userId: user },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

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
          model: Role,
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

export const hostListForAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User.findAll({
      where: { roleId: { [Op.eq]: 1 } },
      include: [{ model: Image }, { model: Role }],
    });

    sendSuccess(res, users, 'Host details retrieved successfully');
  } catch (err) {
    next(err);
  }
};


