import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ChatAttributes {
  id: number;
  roomName: string;
  senderId: number | null;
  message: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  is_active: boolean;
  created_by: number;
  updated_by: number;
  deletionDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type ChatCreationAttributes = Optional<ChatAttributes, 'id' | 'senderId' | 'messageType' | 'is_active' | 'created_by' | 'updated_by' | 'deletionDate'>;

export class ChatMessage extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  public id!: number;
  public roomName!: string;
  public senderId!: number | null;
  public message!: string;
  public messageType!: 'text' | 'image' | 'file' | 'system';
  public is_active!: boolean;
  public created_by!: number;
  public updated_by!: number;
  public deletionDate?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatMessage.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  updated_by: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  deletionDate: { type: DataTypes.DATE, allowNull: true },
  roomName: { type: DataTypes.STRING(255), allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  messageType: { type: DataTypes.ENUM('text', 'image', 'file', 'system'), allowNull: false, defaultValue: 'text' },
}, {
  sequelize,
  tableName: 'chat_messages',
  modelName: 'ChatMessage',
  paranoid: true,
  deletedAt: 'deletionDate',
  indexes: [
    { fields: ['roomName'] },
    { fields: ['senderId'] },
    { fields: ['createdAt'] }
  ]
});

export default ChatMessage;


