import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RoomAttributes {
  id: number;
  name: string;
  sender_id: number;
  receiver_id: number;
  isActive: boolean;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  deletionDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type RoomCreationAttributes = Optional<RoomAttributes, 'id' | 'isActive' | 'is_active' | 'created_by' | 'updated_by' | 'deletionDate'>;

export class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: number;
  public name!: string;
  public sender_id!: number;
  public receiver_id!: number;
  public isActive!: boolean;
  public is_active!: boolean;
  public created_by!: number;
  public updated_by!: number;
  public deletionDate?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Room.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.TEXT, allowNull: true,},
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  updated_by: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  deletionDate: { type: DataTypes.DATE, allowNull: true },
}, {
  sequelize,
  tableName: 'rooms',
  modelName: 'Room',
  paranoid: true,
  deletedAt: 'deletionDate',
});

export default Room;


