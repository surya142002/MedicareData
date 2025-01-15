import { DataTypes, Model } from 'sequelize';

class DatasetUsage extends Model {
    static initModel(sequelize) {
        DatasetUsage.init(
            {
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
                action_type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                search_term: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                },
                usage_count: {
                    type: DataTypes.INTEGER,
                    defaultValue: 1,
                },
                timestamp: {
                    type: DataTypes.DATE,
                    defaultValue: DataTypes.NOW,
                },
            },
            {
                sequelize,
                modelName: 'DatasetUsage',
                tableName: 'DatasetUsage',
                timestamps: false,
            }
        );
    }
}

export default DatasetUsage;
