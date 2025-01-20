import { Model, DataTypes } from 'sequelize';

/**
 * Represents user activity logs in the system.
 * Each log captures actions performed by users, such as login, search, or dataset interactions.
 */
class UserActivity extends Model {
    /**
     * Initializes the UserActivity model with the specified Sequelize instance.
     *
     * @param {Object} sequelizeInstance - The Sequelize instance to associate with this model.
     */
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
                    allowNull: false, // Action type is required
                },
                action_details: {
                    type: DataTypes.TEXT, // Additional details about the action
                },
                timestamp: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW, // Logs the time of the action
                },
                ip_address: {
                    type: DataTypes.STRING, // Captures the user's IP
                },
            },
            {
                sequelize: sequelizeInstance, // Associate with Sequelize instance
                modelName: 'UserActivity', // Name of the model
                tableName: 'UserActivity', // Name of the table in the database
            }
        );
    }
}

export default UserActivity;