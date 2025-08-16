import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ChatAttributes {
  id: number;
  roomName: string;
  senderId: number | null;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type ChatCreationAttributes = Optional<ChatAttributes, 'id' | 'senderId'>;

export class ChatMessage extends Model<ChatAttributes, ChatCreationAttributes> implements ChatAttributes {
  public id!: number;
  public roomName!: string;
  public senderId!: number | null;
  public message!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ChatMessage.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roomName: { type: DataTypes.STRING(255), allowNull: false },
  senderId: { type: DataTypes.INTEGER, allowNull: true },
  message: { type: DataTypes.TEXT, allowNull: false },
}, {
  sequelize,
  tableName: 'chat_messages',
  modelName: 'ChatMessage',
});

export default ChatMessage;


