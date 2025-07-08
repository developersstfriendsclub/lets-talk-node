import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
}

User.init({
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
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
        is_verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
  
        name: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },

        roleId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: 'roles',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        email: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        password: {
          type: DataTypes.STRING(240),
          allowNull: true,
        },
        gender: {
          type: DataTypes.STRING(10),
          allowNull: true,
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: true,
        },

        dob: {
          type: DataTypes.DATEONLY,
          allowNull: true,
        },
},{
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true, // This enables soft deletes (deletedAt)
    deletedAt: 'deletionDate',
  });
