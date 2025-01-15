import { DataTypes, Model } from 'sequelize';

class User extends Model {
    static initModel(sequelize) {
        User.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password_hash: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('user', 'admin'),
                defaultValue: 'user',
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize,
            modelName: 'User',
            tableName: 'Users',
            timestamps: false,
        });
    }

    // Association method
    static associate(models) {
        User.hasMany(models.Datasets, {
            foreignKey: 'uploaded_by',
            as: 'datasets',
        });
        User.hasMany(models.UserActivity, {
            foreignKey: 'user_id',
            as: 'activities',
        });
    }
}

export default User;
