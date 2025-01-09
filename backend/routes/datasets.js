import express from 'express';
import { Dataset, ICD10CM } from '../models/index.js'; // Add explicit index.js

const router = express.Router();

// GET /datasets endpoint
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

export default router;
