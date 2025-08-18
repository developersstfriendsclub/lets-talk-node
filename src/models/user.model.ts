import { DataTypes, Model, Op } from 'sequelize';
import { sequelize } from '../config/database';

export class User extends Model {
  public id!: number;
  public email!: string;
  public password!: string;
  public is_verified!: boolean;
  public approval_status!: 'pending' | 'approved' | 'rejected';
  public is_premium!: boolean;
  public is_popular!: boolean;
  public popular_order!: number | null;
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
        is_premium: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_popular: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        popular_order: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        approval_status: {
          type: DataTypes.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending',
        },
  
        name: {
          type: DataTypes.STRING(50),
          allowNull: true,
        },
        user_profile_id: {
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
        interests: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        sports: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        film: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        music: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        travelling: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        food: {
          type: DataTypes.JSON,
          allowNull: true,
        },
        image: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
},{
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true, // This enables soft deletes (deletedAt)
    deletedAt: 'deletionDate',
    hooks: {
      beforeCreate: async (user: any) => {
        try {
          const lastUser = await User.findOne({
            order: [['createdAt', 'DESC']],
            where: {
              user_profile_id: { [Op.ne]: null }
            }
          });
          let nextId = 2410; // Default start
          const lastProfileId = lastUser ? lastUser.get('user_profile_id') : null;
          if (typeof lastProfileId === 'string') {
            const match = lastProfileId.match(/FDCK(\d{4})/);
            if (match) {
              nextId = parseInt(match[1], 10) + 1;
            }
          }
          user.user_profile_id = `FDCK${nextId}`;
        } catch (err) {
          console.error('Error generating user_profile_id:', err);
          // Use a timestamp-based fallback to ensure uniqueness
          user.user_profile_id = `FDCK${Date.now().toString().slice(-4)}`;
        }
      }
    }
  });