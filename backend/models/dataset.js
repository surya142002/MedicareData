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
            },
            uploaded_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        }, {
            sequelize, // Pass the Sequelize instance here
            modelName: 'Datasets',
            tableName: 'Datasets',
            timestamps: false,
        });
    }
}

export default Datasets;
