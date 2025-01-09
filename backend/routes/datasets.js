import express from 'express';
import { Dataset, ICD10CM } from '../models/index.js'; // Ensure correct path

const router = express.Router();

// GET /datasets endpoint - Fetch all datasets metadata
router.get('/datasets', async (req, res) => {
    try {
        // Fetch datasets metadata
        const datasets = await Dataset.findAll({
            order: [['uploaded_at', 'DESC']], // Order by the most recent upload
        });

        // Fetch additional details for each dataset
        const datasetsWithDetails = await Promise.all(
            datasets.map(async (dataset) => {
                let recordCount = 0;

                // Count records for ICD10CM datasets
                if (dataset.name === 'ICD-10-CM') {
                    recordCount = await ICD10CM.count({ where: { dataset_id: dataset.id } });
                }

                return {
                    ...dataset.toJSON(),
                    recordCount, // Include the number of records for this dataset
                };
            })
        );

        res.json(datasetsWithDetails); // Return enriched dataset details
    } catch (error) {
        console.error('Error fetching datasets:', error);
        res.status(500).json({ error: 'Failed to fetch datasets' });
    }
});

// GET /datasets/:id/data endpoint - Fetch paginated ICD-10-CM data for a specific dataset
router.get('/datasets/:id/data', async (req, res) => {
    const { id } = req.params; // Dataset ID
    const { page = 1, limit = 10 } = req.query; // Pagination parameters

    try {
        const offset = (page - 1) * limit;

        // Fetch paginated ICD-10-CM data for the given dataset ID
        const { rows, count } = await ICD10CM.findAndCountAll({
            where: { dataset_id: id },
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['order_number', 'ASC']], // Optional: order by a specific column
        });

        res.status(200).json({
            data: rows,
            total: count,
            currentPage: parseInt(page, 10),
            totalPages: Math.ceil(count / limit),
        });
    } catch (error) {
        console.error('Error fetching ICD-10-CM data:', error);
        res.status(500).json({ error: 'Failed to fetch dataset data' });
    }
});

export default router;
