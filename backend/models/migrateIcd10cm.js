import { Sequelize } from 'sequelize';
import DatasetEntries from './datasetEntries.js';
import Datasets from './dataset.js';

// Database connection
const sequelize = new Sequelize('medidatabase', 'surya', 'password1', {
    host: 'localhost',
    dialect: 'postgres',
});

const migrateIcd10cm = async () => {
    try {
        // Fetch all ICD-10-CM data
        const icd10cmData = await sequelize.query('SELECT * FROM icd10cm', { type: Sequelize.QueryTypes.SELECT });

        // Create a new dataset entry for ICD-10-CM
        const dataset = await Datasets.create({
            name: 'ICD-10-CM',
            description: 'ICD-10-CM Codes',
            file_path: null,
            uploaded_by: 'REPLACE_WITH_USER_ID',
        });

        // Insert each record into DatasetEntries as JSON
        const entries = icd10cmData.map(row => ({
            dataset_id: dataset.id,
            data: {
                code: row.code,
                short_description: row.short_description,
                long_description: row.long_description,
                order_number: row.order_number,
                is_valid: row.is_valid,
            },
        }));

        await DatasetEntries.bulkCreate(entries);

        console.log('ICD-10-CM data migrated successfully!');
    } catch (error) {
        console.error('Error migrating ICD-10-CM data:', error);
    } finally {
        await sequelize.close();
    }
};

migrateIcd10cm();
