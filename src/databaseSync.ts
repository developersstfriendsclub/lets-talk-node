import { sequelize } from './config/database';
import { Role } from './models/role.model';
import { User } from './models/user.model';
import Image from './models/image.model';
import Video from './models/video.model';
import BankAccount from './models/bankAccount.model';
import ChatMessage from './models/chat.model';
import Call from './models/call.model';

// Define associations
Role.hasMany(User, { foreignKey: 'roleId', onDelete: 'CASCADE' });
User.belongsTo(Role, { foreignKey: 'roleId', onDelete: 'CASCADE' });

User.hasMany(Image, { foreignKey: 'userId', onDelete: 'CASCADE' });
Image.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(Video, { foreignKey: 'userId', onDelete: 'CASCADE' });
Video.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(BankAccount, { foreignKey: 'userId', onDelete: 'CASCADE' });
BankAccount.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

// Chat and Call associations
User.hasMany(ChatMessage, { foreignKey: 'senderId', onDelete: 'CASCADE' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId', onDelete: 'CASCADE' });

User.hasMany(Call, { foreignKey: 'sender_id', onDelete: 'CASCADE' });
Call.belongsTo(User, { foreignKey: 'sender_id', onDelete: 'CASCADE', as: 'sender' });

User.hasMany(Call, { foreignKey: 'receiver_id', onDelete: 'CASCADE' });
Call.belongsTo(User, { foreignKey: 'receiver_id', onDelete: 'CASCADE', as: 'receiver' });

export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    process.exit(1);
  }
};