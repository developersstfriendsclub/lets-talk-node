import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface ImageAttributes {
  id: number;
  userId: number;
  title: string;
  image_type: string;
  description?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url: string;
  width?: number;
  height?: number;
  isPublic: boolean;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  deletionDate?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ImageCreationAttributes extends Optional<ImageAttributes, 'id' | 'createdAt' | 'updatedAt' | 'is_active' | 'created_by' | 'updated_by' | 'deletionDate'> {}

class Image extends Model<ImageAttributes, ImageCreationAttributes> implements ImageAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public image_type!: string;
  public description?: string;
  public filename!: string;
  public originalName!: string;
  public mimeType!: string;
  public size!: number;
  public path!: string;
  public url!: string;
  public width?: number;
  public height?: number;
  public isPublic!: boolean;
  public is_active!: boolean;
  public created_by!: number;
  public updated_by!: number;
  public deletionDate?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Image.init(
  {
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
    image_type: {
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
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'images',
    timestamps: true,
    paranoid: true,
    deletedAt: 'deletionDate',
  }
);

export default Image; 