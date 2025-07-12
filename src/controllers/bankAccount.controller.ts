import { Request, Response } from 'express';
import BankAccount from '../models/bankAccount.model';
import { sendSuccess, sendError, sendNotFound, sendValidationError } from '../utils/response';

// Create bank account
export const createBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const {
      accountHolderName,
      accountNumber,
      bankName,
      branchCode,
      ifscCode,
      swiftCode,
      accountType,
      currency,
      isDefault
    } = req.body;

    // If this is set as default, unset other default accounts
    if (isDefault) {
      await BankAccount.update(
        { isDefault: false },
        { where: { userId, isDefault: true } }
      );
    }

    const bankAccount = await BankAccount.create({
      userId,
      accountHolderName,
      accountNumber,
      bankName,
      branchCode,
      ifscCode,
      swiftCode,
      accountType: accountType || 'savings',
      currency: currency || 'USD',
      isActive: true,
      isDefault: isDefault || false,
    });

    sendSuccess(res, bankAccount, 'Bank account created successfully');
  } catch (error) {
    sendError(res, 'Failed to create bank account', 500, error);
  }
};

// Get bank account by ID
export const getBankAccountById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const bankAccount = await BankAccount.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!bankAccount) {
      sendNotFound(res, 'Bank account not found');
      return;
    }

    sendSuccess(res, bankAccount, 'Bank account retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve bank account', 500, error);
  }
};

// Get user's bank accounts with pagination
export const getUserBankAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const page = req.query.page as string || '1';
    const limit = req.query.limit as string || '10';
    const isActive = req.query.isActive as string;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const whereClause: any = { userId };
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    const { count, rows } = await BankAccount.findAndCountAll({
      where: whereClause,
      limit: limitNum,
      offset,
      order: [['createdAt', 'DESC']],
    });

    const totalPages = Math.ceil(count / limitNum);

    sendSuccess(res, {
      bankAccounts: rows,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: count,
        itemsPerPage: limitNum,
      }
    }, 'Bank accounts retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve bank accounts', 500, error);
  }
};

// Update bank account
export const updateBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updateData = req.body;

    const bankAccount = await BankAccount.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!bankAccount) {
      sendNotFound(res, 'Bank account not found');
      return;
    }

    // If setting as default, unset other default accounts
    if (updateData.isDefault) {
      await BankAccount.update(
        { isDefault: false },
        { where: { userId, isDefault: true, id: { [require('sequelize').Op.ne]: parseInt(id) } } }
      );
    }

    await bankAccount.update(updateData);

    sendSuccess(res, bankAccount, 'Bank account updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update bank account', 500, error);
  }
};

// Delete bank account
export const deleteBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const bankAccount = await BankAccount.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!bankAccount) {
      sendNotFound(res, 'Bank account not found');
      return;
    }

    await bankAccount.destroy();

    sendSuccess(res, null, 'Bank account deleted successfully');
  } catch (error) {
    sendError(res, 'Failed to delete bank account', 500, error);
  }
};

// Set default bank account
export const setDefaultBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const bankAccount = await BankAccount.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!bankAccount) {
      sendNotFound(res, 'Bank account not found');
      return;
    }

    // Unset all other default accounts
    await BankAccount.update(
      { isDefault: false },
      { where: { userId, isDefault: true } }
    );

    // Set this account as default
    await bankAccount.update({ isDefault: true });

    sendSuccess(res, bankAccount, 'Default bank account set successfully');
  } catch (error) {
    sendError(res, 'Failed to set default bank account', 500, error);
  }
};

// Get default bank account
export const getDefaultBankAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const bankAccount = await BankAccount.findOne({
      where: {
        userId,
        isDefault: true,
        isActive: true,
      }
    });

    if (!bankAccount) {
      sendNotFound(res, 'No default bank account found');
      return;
    }

    sendSuccess(res, bankAccount, 'Default bank account retrieved successfully');
  } catch (error) {
    sendError(res, 'Failed to retrieve default bank account', 500, error);
  }
};

// Toggle bank account active status
export const toggleBankAccountStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const bankAccount = await BankAccount.findOne({
      where: {
        id: parseInt(id),
        userId,
      }
    });

    if (!bankAccount) {
      sendNotFound(res, 'Bank account not found');
      return;
    }

    // Don't allow deactivating the default account
    if (bankAccount.isDefault && bankAccount.isActive) {
      sendValidationError(res, 'Cannot deactivate the default bank account');
      return;
    }

    await bankAccount.update({ isActive: !bankAccount.isActive });

    sendSuccess(res, bankAccount, 'Bank account status updated successfully');
  } catch (error) {
    sendError(res, 'Failed to update bank account status', 500, error);
  }
}; 