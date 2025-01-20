import { DataTypes, Model } from 'sequelize';

/**
 * Represents an individual entry in a dataset.
 * Each entry corresponds to a single data point in the dataset (e.g., a code and its description).
 */
class DatasetEntries extends Model {
    /**
     * Initializes the DatasetEntries model with its fields and configurations.
     * @param {Sequelize} sequelize - The Sequelize instance.
     */
    static initModel(sequelize) {
        DatasetEntries.init({
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            dataset_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: 'Datasets', // reference to Datasets table
                    key: 'id', // key in Datasets table
                },
            },
            data: {
                type: DataTypes.JSONB, // JSONB data type to store the actual data
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW, // set default value to current timestamp
            },
        }, {
            sequelize, // Pass the Sequelize instance here
            modelName: 'DatasetEntries', // Define the model name
            tableName: 'DatasetEntries', // Define the table name
            timestamps: false,
        });
    }

    /**
     * Establishes associations between DatasetEntries and other models.
     * @param {Object} models - An object containing all initialized models.
     */
    static associate(models) {
        DatasetEntries.belongsTo(models.Datasets, {
            foreignKey: 'dataset_id',
            as: 'dataset', // alias for the association
        });
    }
}

export default DatasetEntries;
