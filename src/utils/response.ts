import { Response } from 'express';

// Standard response interface
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  developerMessage?: string;
  data?: T;
  error?: string;
  statusCode: number;
  timestamp: string;
}

// Success response helper
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'Success',
  statusCode: number = 200,
  developerMessage: string = ''
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    developerMessage,
    data,
    statusCode,
    timestamp: new Date().toISOString()
  };
  
  return res.status(statusCode).json(response);
};

// Error response helper
export const sendError = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  error?: any,
  developerMessage: string = ''
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    developerMessage: developerMessage || (error?.stack || error?.message || error),
    error: error?.message || error,
    statusCode,
    timestamp: new Date().toISOString()
  };
  
  return res.status(statusCode).json(response);
};

// Validation error response helper
export const sendValidationError = (
  res: Response,
  message: string = 'Validation Error',
  errors?: any,
  developerMessage: string = ''
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    developerMessage: developerMessage || (errors ? JSON.stringify(errors) : ''),
    error: errors,
    statusCode: 400,
    timestamp: new Date().toISOString()
  };
  
  return res.status(400).json(response);
};

// Not found response helper
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found',
  developerMessage: string = ''
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    developerMessage,
    statusCode: 404,
    timestamp: new Date().toISOString()
  };
  
  return res.status(404).json(response);
};

// Unauthorized response helper
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized',
  developerMessage: string = ''
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    developerMessage,
    statusCode: 401,
    timestamp: new Date().toISOString()
  };
  
  return res.status(401).json(response);
}; 