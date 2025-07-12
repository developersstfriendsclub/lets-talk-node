import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  createBankAccount,
  getBankAccountById,
  getUserBankAccounts,
  updateBankAccount,
  deleteBankAccount,
  setDefaultBankAccount,
  getDefaultBankAccount,
  toggleBankAccountStatus
} from '../controllers/bankAccount.controller';

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create bank account
router.post(
  '/',
  createBankAccount
);

// Get single bank account by ID
router.get(
  '/:id',
  getBankAccountById
);

// Get user's bank accounts with pagination
router.get(
  '/',
  getUserBankAccounts
);

// Update bank account
router.put(
  '/:id',
  updateBankAccount
);

// Delete bank account
router.delete(
  '/:id',
  deleteBankAccount
);

// Set default bank account
router.patch(
  '/:id/default',
  setDefaultBankAccount
);

// Get default bank account
router.get(
  '/default/current',
  getDefaultBankAccount
);

// Toggle bank account status
router.patch(
  '/:id/toggle-status',
  toggleBankAccountStatus
);

export default router; 