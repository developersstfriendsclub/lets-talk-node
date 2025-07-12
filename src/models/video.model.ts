import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface VideoAttributes {
  id: number;
  userId: number;
  title: string;
  description?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  thumbnailPath?: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  status: 'processing' | 'completed' | 'failed';
  createdAt?: Date;
  updatedAt?: Date;
}

interface VideoCreationAttributes extends Optional<VideoAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Video extends Model<VideoAttributes, VideoCreationAttributes> implements VideoAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public description?: string;
  public filename!: string;
  public originalName!: string;
  public mimeType!: string;
  public size!: number;
  public path!: string;
  public url!: string;
  public duration?: number;
  public width?: number;
  public height?: number;
  public thumbnailPath?: string;
  public thumbnailUrl?: string;
  public isPublic!: boolean;
  public status!: 'processing' | 'completed' | 'failed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Video.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    thumbnailPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    thumbnailUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('processing', 'completed', 'failed'),
      allowNull: false,
      defaultValue: 'processing',
    },
  },
  {
    sequelize,
    tableName: 'videos',
    timestamps: true,
  }
);

export default Video; 