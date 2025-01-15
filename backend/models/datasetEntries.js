import { DataTypes, Model } from 'sequelize';

class DatasetEntries extends Model {
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
                    model: 'Datasets',
                    key: 'id',
                },
            },
            data: {
                type: DataTypes.JSONB,
                allowNull: false,
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize, // Pass the Sequelize instance here
            modelName: 'DatasetEntries',
            tableName: 'DatasetEntries',
            timestamps: false,
        });
    }

    // Association method
    static associate(models) {
        DatasetEntries.belongsTo(models.Datasets, {
            foreignKey: 'dataset_id',
            as: 'dataset',
        });
    }
}

export default DatasetEntries;
