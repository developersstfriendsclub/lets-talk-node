import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './user.model';

interface PaymentAttributes {
    id: number;
    transactionId: string;
    userId: number;
    amount: number; // In smallest currency unit, e.g., paise for INR
    usersEarnedSeconds: number; // TODO: Calculate based on amount
    status: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
    currency: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    is_active: boolean;
    created_by: number;
    updated_by: number;
    deletionDate?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
}

interface PaymentCreationAttributes extends Optional<PaymentAttributes, 'id' | 'createdAt' | 'updatedAt' | 'is_active' | 'created_by' | 'updated_by' | 'deletionDate' | 'status' | 'razorpayOrderId' | 'razorpayPaymentId' | 'razorpaySignature'> { }

class Payment extends Model<PaymentAttributes, PaymentCreationAttributes> implements PaymentAttributes {
    public id!: number;
    public transactionId!: string;
    public userId!: number;
    public amount!: number;
    public usersEarnedSeconds!: number;
    public status!: 'created' | 'authorized' | 'captured' | 'failed' | 'refunded';
    public currency!: string;
    public razorpayOrderId?: string;
    public razorpayPaymentId?: string;
    public razorpaySignature?: string;
    public is_active!: boolean;
    public created_by!: number;
    public updated_by!: number;
    public deletionDate?: Date | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Payment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        transactionId: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },
        amount: {
            type: DataTypes.INTEGER, // Store in paise or smallest unit
            allowNull: false,
        },
        usersEarnedSeconds: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0, // TODO: Implement logic to calculate
        },
        status: {
            type: DataTypes.ENUM('created', 'authorized', 'captured', 'failed', 'refunded'),
            allowNull: false,
            defaultValue: 'created',
        },
        currency: {
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: 'INR',
        },
        razorpayOrderId: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        razorpayPaymentId: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        razorpaySignature: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        deletionDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        sequelize,
        tableName: 'payments',
        timestamps: true,
        paranoid: true,
        deletedAt: 'deletionDate',
    }
);

Payment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });

export default Payment;