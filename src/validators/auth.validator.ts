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

// Update User validation
export const updateUserValidation = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string"),
  body("gender")
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage("Gender must be male, female, or other"),
  body("phone")
    .optional()
    .isMobilePhone('any')
    .withMessage("Invalid phone number format"),
  body("dob")
    .optional()
    .isISO8601({ strict: true })
    .withMessage("Date of birth must be in YYYY-MM-DD format"),
  body("interests")
    .optional()
    .isArray()
    .withMessage("Interests must be an array of strings"),
  body("interests.*")
    .optional()
    .isString()
    .withMessage("Each interest must be a string"),
  body("sports")
    .optional()
    .isArray()
    .withMessage("Sports must be an array of strings"),
  body("sports.*")
    .optional()
    .isString()
    .withMessage("Each sport must be a string"),
  body("film")
    .optional()
    .isArray()
    .withMessage("Film must be an array of strings"),
  body("film.*")
    .optional()
    .isString()
    .withMessage("Each film must be a string"),
  body("music")
    .optional()
    .isArray()
    .withMessage("Music must be an array of strings"),
  body("music.*")
    .optional()
    .isString()
    .withMessage("Each music must be a string"),
  body("travelling")
    .optional()
    .isArray()
    .withMessage("Travelling must be an array of strings"),
  body("travelling.*")
    .optional()
    .isString()
    .withMessage("Each travelling must be a string"),
  body("food")
    .optional()
    .isArray()
    .withMessage("Food must be an array of strings"),
  body("food.*")
    .optional()
    .isString()
    .withMessage("Each food must be a string"),
  body("image")
    .optional()
    .isString()
    .withMessage("Image must be a string (base64)")
    .matches(/^data:image\/(png|jpeg|jpg|gif);base64,.+/)
    .withMessage("Image must be a valid base64-encoded image string"),
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
