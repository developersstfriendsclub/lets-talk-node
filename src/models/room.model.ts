import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface RoomAttributes {
  id: number;
  name: string;
  callerId: number;
  calleeId: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type RoomCreationAttributes = Optional<RoomAttributes, 'id' | 'isActive'>;

export class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: number;
  public name!: string;
  public callerId!: number;
  public calleeId!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Room.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  callerId: { type: DataTypes.INTEGER, allowNull: false },
  calleeId: { type: DataTypes.INTEGER, allowNull: false },
  isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  sequelize,
  tableName: 'rooms',
  modelName: 'Room',
});

export default Room;


