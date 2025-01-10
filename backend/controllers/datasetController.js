import Datasets from '../models/dataset.js';
import DatasetEntries from '../models/datasetEntries.js';

export const uploadDataset = async (req, res) => {
    try {
        const { name, description, rows } = req.body;

        console.log('Uploading dataset:', name);

        // Create a new dataset
        const dataset = await Datasets.create({
            name,
            description,
            file_path: req.file ? req.file.path : null,
            uploaded_by: req.user.id, // Ensure req.user.id is populated
        });

        console.log('Dataset created:', dataset);

        // Insert rows dynamically
        const entries = rows.map(row => ({
            dataset_id: dataset.id,
            data: row, // Convert each row to JSON
        }));
        await DatasetEntries.bulkCreate(entries);

        res.status(201).json({ message: 'Dataset uploaded successfully', dataset });
    } catch (error) {
        console.error('Error uploading dataset:', error);
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
            whereCondition.data = {
                $contains: {
                    description: { $iLike: `%${searchTerm}%` },
                },
            };
        }

        console.log('Fetching dataset entries for:', datasetId);

        const entries = await DatasetEntries.findAndCountAll({
            where: whereCondition,
            limit: parseInt(limit),
            offset,
        });

        console.log('Dataset entries fetched successfully:', entries);

        res.status(200).json({
            entries: entries.rows,
            count: entries.count,
            currentPage: page,
            totalPages: Math.ceil(entries.count / limit),
        });
    } catch (error) {
        console.error('Error fetching dataset entries:', error);
        res.status(500).json({ message: 'Failed to fetch dataset entries' });
    }
};
