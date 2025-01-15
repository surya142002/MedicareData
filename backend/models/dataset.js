import { DataTypes, Model } from 'sequelize';

class Datasets extends Model {
    static initModel(sequelize) {
        Datasets.init({
            id: {
                type: DataTypes.UUID,
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
                defaultValue: DataTypes.NOW,
            },
            type: {
                type: DataTypes.STRING, // New column for dataset type
                allowNull: false,
                defaultValue: 'default',
            },
        }, {
            sequelize, // Pass the Sequelize instance here
            modelName: 'Datasets',
            tableName: 'Datasets',
            timestamps: false,
        });
    }

    // Association method
    static associate(models) {
        Datasets.belongsTo(models.User, {
            foreignKey: 'uploaded_by',
            as: 'uploader',
        });
        Datasets.hasMany(models.DatasetEntries, {
            foreignKey: 'dataset_id',
            onDelete: 'CASCADE',
            as: 'entries',
        });
        Datasets.hasMany(models.DatasetUsage, {
            foreignKey: 'dataset_id',
            as: 'usage',
        });
    }
}

export default Datasets;
