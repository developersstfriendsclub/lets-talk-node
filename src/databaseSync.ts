import { sequelize } from './config/database';
import { Role } from './models/role.model';
import { User } from './models/user.model';


Role.hasMany(User, { foreignKey: 'roleId', onDelete: 'CASCADE' });
User.belongsTo(Role, { foreignKey: 'roleId', onDelete: 'CASCADE' });


export const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Database tables synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync error:', error);
    process.exit(1);
  }
};