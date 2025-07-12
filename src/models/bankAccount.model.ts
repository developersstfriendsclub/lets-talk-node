import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface BankAccountAttributes {
  id: number;
  userId: number;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  branchCode?: string;
  ifscCode?: string;
  swiftCode?: string;
  accountType: 'savings' | 'current' | 'checking';
  currency: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BankAccountCreationAttributes extends Optional<BankAccountAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class BankAccount extends Model<BankAccountAttributes, BankAccountCreationAttributes> implements BankAccountAttributes {
  public id!: number;
  public userId!: number;
  public accountHolderName!: string;
  public accountNumber!: string;
  public bankName!: string;
  public branchCode?: string;
  public ifscCode?: string;
  public swiftCode?: string;
  public accountType!: 'savings' | 'current' | 'checking';
  public currency!: string;
  public isActive!: boolean;
  public isDefault!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

BankAccount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    accountHolderName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    bankName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    branchCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    ifscCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    swiftCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    accountType: {
      type: DataTypes.ENUM('savings', 'current', 'checking'),
      allowNull: false,
      defaultValue: 'savings',
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'USD',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'bank_accounts',
    timestamps: true,
  }
);

export default BankAccount; 