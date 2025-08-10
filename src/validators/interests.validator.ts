import { body } from 'express-validator';

// Update interests validation
export const updateInterestsValidation = [
  body("interests")
    .isArray({ min: 1, max: 5 })
    .withMessage("Interests must be an array with 1-5 items"),
  body("interests.*")
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each interest must be a string between 1-50 characters"),
  body("sports")
    .optional()
    .isArray()
    .withMessage("Sports must be an array of strings"),
  body("sports.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each sport must be a string between 1-50 characters"),
  body("film")
    .optional()
    .isArray()
    .withMessage("Film must be an array of strings"),
  body("film.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each film must be a string between 1-50 characters"),
  body("music")
    .optional()
    .isArray()
    .withMessage("Music must be an array of strings"),
  body("music.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each music must be a string between 1-50 characters"),
  body("travelling")
    .optional()
    .isArray()
    .withMessage("Travelling must be an array of strings"),
  body("travelling.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each travelling must be a string between 1-50 characters"),
  body("food")
    .optional()
    .isArray()
    .withMessage("Food must be an array of strings"),
  body("food.*")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Each food must be a string between 1-50 characters"),
];
