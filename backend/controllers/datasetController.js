import Datasets from '../models/dataset.js';
import DatasetEntries from '../models/datasetEntries.js';

export const uploadDataset = async (req, res) => {
    try {
        const { name, description, rows } = req.body;

        // Create a new dataset
        const dataset = await Datasets.create({
            name,
            description,
            file_path: req.file ? req.file.path : null,
            uploaded_by: req.user.id,
        });

        // Insert rows dynamically
        const entries = rows.map(row => ({
            dataset_id: dataset.id,
            data: row, // Convert each row to JSON
        }));
        await DatasetEntries.bulkCreate(entries);

        res.status(201).json({ message: 'Dataset uploaded successfully', dataset });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to upload dataset' });
    }
};

export const getDatasetEntries = async (req, res) => {
    try {
        const { datasetId } = req.params;
        const { searchTerm, page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        const whereCondition = { dataset_id: datasetId };
        if (searchTerm) {
            whereCondition.data = { $contains: { description: { $iLike: `%${searchTerm}%` } } };
        }

        const entries = await DatasetEntries.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
        });

        res.status(200).json({ entries: entries.rows, count: entries.count });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch dataset entries' });
    }
};
