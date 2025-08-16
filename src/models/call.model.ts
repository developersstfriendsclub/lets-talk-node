import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type CallStatus = 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed';

interface CallAttributes {
  id: number;
  callerId: number;
  calleeId: number;
  roomName: string;
  status: CallStatus;
  startedAt: Date | null;
  answeredAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number;
  createdAt?: Date;
  updatedAt?: Date;
}

type CallCreationAttributes = Optional<CallAttributes, 'id' | 'status' | 'startedAt' | 'answeredAt' | 'endedAt' | 'durationSeconds'>;

export class Call extends Model<CallAttributes, CallCreationAttributes> implements CallAttributes {
  public id!: number;
  public callerId!: number;
  public calleeId!: number;
  public roomName!: string;
  public status!: CallStatus;
  public startedAt!: Date | null;
  public answeredAt!: Date | null;
  public endedAt!: Date | null;
  public durationSeconds!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Call.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  callerId: { type: DataTypes.INTEGER, allowNull: false },
  calleeId: { type: DataTypes.INTEGER, allowNull: false },
  roomName: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.ENUM('ringing','accepted','rejected','ended','missed'), allowNull: false, defaultValue: 'ringing' },
  startedAt: { type: DataTypes.DATE, allowNull: true },
  answeredAt: { type: DataTypes.DATE, allowNull: true },
  endedAt: { type: DataTypes.DATE, allowNull: true },
  durationSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
}, {
  sequelize,
  tableName: 'call_logs',
  modelName: 'Call',
});

export default Call;


