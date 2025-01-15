import { DataTypes, Model } from 'sequelize';

class UserActivity extends Model {
    static initModel(sequelize) {
        UserActivity.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                user_id: {
                    type: DataTypes.UUID,
                    allowNull: false,
                    references: {
                        model: 'Users',
                        key: 'id',
                    },
                },
                action_type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                action_details: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                timestamp: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                },
                ip_address: {
                    type: DataTypes.STRING,
                    allowNull: true,
                },
            },
            {
                sequelize,
                modelName: 'UserActivity',
                tableName: 'UserActivity',
                timestamps: false,
            }
        );
    }
}

export default UserActivity;
