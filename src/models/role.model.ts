import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';

export class Role extends Model {
  public id!: number;
  public name!: string;
  public type!: string;
  public description!: string;
}

Role.init({
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

        type: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },

        description: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
},{
    sequelize,
    modelName: 'Role',
    tableName: 'roles',
    timestamps: true,
    paranoid: true,
    deletedAt: 'deletionDate',
  });
