import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export type CallStatus = 'ringing' | 'accepted' | 'rejected' | 'ended' | 'missed' | 'busy' | 'cancelled';
export type CallType = 'audio' | 'video';

interface CallAttributes {
  id: number;
  sender_id: number;
  receiver_id: number;
  roomName: string;
  status: CallStatus;
  callType: CallType;
  startedAt: Date | null;
  answeredAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  deletionDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

type CallCreationAttributes = Optional<CallAttributes, 'id' | 'status' | 'callType' | 'startedAt' | 'answeredAt' | 'endedAt' | 'durationSeconds' | 'is_active' | 'created_by' | 'updated_by' | 'deletionDate'>;

export class Call extends Model<CallAttributes, CallCreationAttributes> implements CallAttributes {
  public id!: number;
  public sender_id!: number;
  public receiver_id!: number;
  public roomName!: string;
  public status!: CallStatus;
  public callType!: CallType;
  public startedAt!: Date | null;
  public answeredAt!: Date | null;
  public endedAt!: Date | null;
  public durationSeconds!: number;
  public is_active!: boolean;
  public created_by!: number;
  public updated_by!: number;
  public deletionDate?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Call.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  receiver_id: { type: DataTypes.INTEGER, allowNull: false },
  roomName: { type: DataTypes.STRING(255), allowNull: false },
  status: { type: DataTypes.ENUM('ringing','accepted','rejected','ended','missed','busy','cancelled'), allowNull: false, defaultValue: 'ringing' },
  callType: { type: DataTypes.ENUM('audio','video'), allowNull: false, defaultValue: 'video' },
  startedAt: { type: DataTypes.DATE, allowNull: true },
  answeredAt: { type: DataTypes.DATE, allowNull: true },
  endedAt: { type: DataTypes.DATE, allowNull: true },
  durationSeconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  created_by: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  updated_by: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  deletionDate: { type: DataTypes.DATE, allowNull: true },
}, {
  sequelize,
  tableName: 'call_logs',
  modelName: 'Call',
  paranoid: true,
  deletedAt: 'deletionDate',
  indexes: [
    { fields: ['sender_id'] },
    { fields: ['receiver_id'] },
    { fields: ['roomName'] },
    { fields: ['status'] },
    { fields: ['createdAt'] }
  ]
});

export default Call;


