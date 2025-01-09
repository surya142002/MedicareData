import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const ICD10CM = sequelize.define('ICD10CM', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    short_description: {
        type: DataTypes.TEXT,
    },
    long_description: {
        type: DataTypes.TEXT,
    },
    order_number: {
        type: DataTypes.INTEGER,
    },
    is_valid: {
        type: DataTypes.BOOLEAN,
    },
    dataset_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
}, {
    tableName: 'icd10cm',
    timestamps: false,
});

export { ICD10CM };
