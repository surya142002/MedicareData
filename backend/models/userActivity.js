// userActivity.js
import { Model, DataTypes } from 'sequelize';

class UserActivity extends Model {
    static initModel(sequelizeInstance) {
        UserActivity.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                },
                action_type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                action_details: {
                    type: DataTypes.TEXT,
                },
                timestamp: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                },
                ip_address: {
                    type: DataTypes.STRING,
                },
            },
            {
                sequelize: sequelizeInstance,
                modelName: 'UserActivity',
                tableName: 'UserActivity',
            }
        );
    }
}

export default UserActivity;