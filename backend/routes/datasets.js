import express from 'express';
import { uploadDataset, getDatasetEntries, deleteDataset } from '../controllers/datasetController.js';
import Datasets from '../models/dataset.js';
import { verifyToken } from '../middleware/authMiddleware.js'; // Import verifyToken middleware

const router = express.Router();

// Upload a new dataset
router.post('/upload', verifyToken, uploadDataset);

// Delete a dataset by ID
router.delete('/:datasetId', verifyToken, deleteDataset);

// GET /datasets - Fetch all datasets metadata
router.get('/', async (req, res) => {
    try {
      const datasets = await Datasets.findAll({
        order: [['uploaded_at', 'DESC']],
      });
      res.json(datasets);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      res.status(500).json({ error: 'Failed to fetch datasets' });
    }
  });
  

// GET /datasets/:datasetId/entries - Fetch paginated dataset entries
router.get('/:datasetId/entries', getDatasetEntries);

export default router;
