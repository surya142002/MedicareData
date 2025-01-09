import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Dataset = sequelize.define('Dataset', {
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
        allowNull: true,
    },
    file_path: {
        type: DataTypes.STRING,
        allowNull: false,
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
    tableName: 'datasets', // Explicitly define the table name
    timestamps: false,    // Disable automatic timestamp columns
});

export { Dataset };
