import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '../utils/response';

// Sign Up validation
export const signUpValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 1 })
    .withMessage("Name must not be empty"),
  body("gender")
    .trim()
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(['male', 'female', 'other'])
    .withMessage("Gender must be male, female, or other"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone('any')
    .withMessage("Invalid phone number format")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits"),
  body("dob")
    .trim()
    .notEmpty()
    .withMessage("Date of birth is required")
    .isISO8601({ strict: true })
    .withMessage("Date of birth must be in YYYY-MM-DD format"),
];

// Sign In validation
export const signInValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required"),
];

// Phone number validation
export const phoneNumberValidation = [
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isMobilePhone('any')
    .withMessage("Invalid phone number format")
    .isLength({ min: 10, max: 10 })
    .withMessage("Phone number must be 10 digits"),
];

// Validation middleware function
export function validateRequestSchema(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    sendValidationError(
      res,
      errors.array()[0].msg,
      errors.array(),
      `Validation failed for ${req.path}`
    );
    return;
  }
  next();
}
