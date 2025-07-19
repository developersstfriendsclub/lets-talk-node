import { sequelize } from './config/database';
import { Role } from './models/role.model';
import { User } from './models/user.model';
import Image from './models/image.model';
import Video from './models/video.model';
import BankAccount from './models/bankAccount.model';

// Define associations
Role.hasMany(User, { foreignKey: 'roleId', onDelete: 'CASCADE' });
User.belongsTo(Role, { foreignKey: 'roleId', onDelete: 'CASCADE' });

User.hasMany(Image, { foreignKey: 'userId', onDelete: 'CASCADE' });
Image.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(Video, { foreignKey: 'userId', onDelete: 'CASCADE' });
Video.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

User.hasMany(BankAccount, { foreignKey: 'userId', onDelete: 'CASCADE' });
BankAccount.belongsTo(User, { foreignKey: 'userId', onDelete: 'CASCADE' });

export const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: false });
    console.log('✅ Database tables synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    process.exit(1);
  }
};