import { DataTypes, Model } from 'sequelize';

/**
 * Represents a user in the system.
 * Users can be assigned roles (e.g., "user" or "admin") and authenticate with email and password.
 */
class User extends Model {
    /**
     * Initializes the User model with the specified Sequelize instance.
     *
     * @param {Object} sequelize - The Sequelize instance to associate with this model.
     */
    static initModel(sequelize) {
        User.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false, // Email is required
                unique: true, // Email is unique
            },
            password_hash: {
                type: DataTypes.STRING, // Stores the hashed password
                allowNull: false,
            },
            role: {
                type: DataTypes.ENUM('user', 'admin'), // User roles: user or admin
                defaultValue: 'user', // Default role is user. Right now only way to change is through direct database manipulation
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW, // Set the default value to the current date/time
            },
        }, {
            sequelize, // Sequelize instance
            modelName: 'User', // Model name
            tableName: 'Users', // Table name
            timestamps: false,
        });
    }

    /**
     * Defines associations between models.
     *
     * @param {Object} models - The models to associate with.
     */
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
