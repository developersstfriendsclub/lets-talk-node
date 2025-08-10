import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { validateRequestSchema } from '../validators/auth.validator';
import { updateInterestsValidation } from '../validators/interests.validator';
import { getUserInterests, updateUserInterests } from '../controllers/interests.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get user interests
router.get('/', getUserInterests);

// Update user interests
router.post('/', updateUserInterests);

export default router;
