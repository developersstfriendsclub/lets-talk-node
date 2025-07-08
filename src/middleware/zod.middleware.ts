import { AnyZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/response';

export const validate =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (err: any) {
      return sendValidationError(res, err.errors?.[0]?.message || 'Validation error', err.errors);
    }
  };
