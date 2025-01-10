import express from 'express';
import { uploadDataset, getDatasetEntries } from '../controllers/datasetController.js';
import Datasets from '../models/dataset.js';

const router = express.Router();

// POST /datasets/upload - Upload a new dataset
router.post('/upload', uploadDataset);

// GET /datasets - Fetch all datasets metadata
router.get('/', async (req, res) => {
    try {
        // Fetch datasets metadata
        const datasets = await Datasets.findAll({
            order: [['uploaded_at', 'DESC']], // Order by the most recent upload
        });

        res.json(datasets); // Return dataset metadata
    } catch (error) {
        console.error('Error fetching datasets:', error);
        res.status(500).json({ error: 'Failed to fetch datasets' });
    }
});

// GET /datasets/:datasetId/entries - Fetch paginated dataset entries
router.get('/:datasetId/entries', getDatasetEntries);

export default router;
