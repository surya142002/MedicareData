import { DataTypes, Model } from 'sequelize';

/**
 * Represents a dataset uploaded by an admin.
 * Contains metadata about the dataset, such as its name, description, and type.
 */
class Datasets extends Model {
    /**
     * Initializes the Datasets model with its fields and configurations.
     * @param {Sequelize} sequelize - The Sequelize instance.
     */
    static initModel(sequelize) {
        Datasets.init({
            id: {
                type: DataTypes.UUID, // UUID data type
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT,
            },
            file_path: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            uploaded_by: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Users',
                    key: 'id',
                },
            },
            uploaded_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW, // set default value to current timestamp
            },
            type: {
                type: DataTypes.STRING,
                allowNull: false,
                defaultValue: 'default',
            },
        }, {
            sequelize, // Pass the Sequelize instance here
            modelName: 'Datasets', // Define the model name
            tableName: 'Datasets', // Define the table name
            timestamps: false,
        });
    }

    /**
     * Establishes associations between Datasets and other models.
     * @param {Object} models - An object containing all initialized models.
     */
    static associate(models) {
        Datasets.belongsTo(models.User, {
            foreignKey: 'uploaded_by',
            as: 'uploader', // alias for the association
        });
        Datasets.hasMany(models.DatasetEntries, {
            foreignKey: 'dataset_id',
            onDelete: 'CASCADE', // delete all entries when a dataset is deleted
            as: 'entries',
        });
        Datasets.hasMany(models.DatasetUsage, {
            foreignKey: 'dataset_id',
            as: 'usage', // alias for the association
        });
    }
}

export default Datasets;
