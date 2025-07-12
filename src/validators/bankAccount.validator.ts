import { z } from 'zod';

// Create bank account validator
export const createBankAccountSchema = z.object({
  accountHolderName: z.string().min(1, 'Account holder name is required').max(255, 'Account holder name must be less than 255 characters'),
  accountNumber: z.string().min(1, 'Account number is required').max(50, 'Account number must be less than 50 characters'),
  bankName: z.string().min(1, 'Bank name is required').max(255, 'Bank name must be less than 255 characters'),
  branchCode: z.string().optional(),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
  accountType: z.enum(['savings', 'current', 'checking']).default('savings'),
  currency: z.string().min(1, 'Currency is required').max(10, 'Currency must be less than 10 characters').default('USD'),
  isDefault: z.boolean().default(false),
});

// Update bank account validator
export const updateBankAccountSchema = z.object({
  accountHolderName: z.string().min(1, 'Account holder name is required').max(255, 'Account holder name must be less than 255 characters').optional(),
  accountNumber: z.string().min(1, 'Account number is required').max(50, 'Account number must be less than 50 characters').optional(),
  bankName: z.string().min(1, 'Bank name is required').max(255, 'Bank name must be less than 255 characters').optional(),
  branchCode: z.string().optional(),
  ifscCode: z.string().optional(),
  swiftCode: z.string().optional(),
  accountType: z.enum(['savings', 'current', 'checking']).optional(),
  currency: z.string().min(1, 'Currency is required').max(10, 'Currency must be less than 10 characters').optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
});

// Get bank account by ID validator
export const getBankAccountByIdSchema = z.object({
  id: z.string().regex(/^\d+$/, 'Bank account ID must be a number'),
});

// Get user bank accounts validator
export const getUserBankAccountsSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').default('1'),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').default('10'),
  isActive: z.string().optional(),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>;
export type UpdateBankAccountInput = z.infer<typeof updateBankAccountSchema>;
export type GetBankAccountByIdInput = z.infer<typeof getBankAccountByIdSchema>;
export type GetUserBankAccountsInput = z.infer<typeof getUserBankAccountsSchema>; 