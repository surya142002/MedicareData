import express from 'express';
import { uploadDataset, getDatasetEntries, deleteDataset } from '../controllers/datasetController.js';
import Datasets from '../models/dataset.js';
import { upload } from '../middleware/fileUpload.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js'; 
import { logUserActivity } from '../controllers/analyticsController.js';


const router = express.Router();

// Upload a new dataset
router.post('/upload', verifyToken, isAdmin, upload.single('file'), async (req, res, next) => {
  try {
      await uploadDataset(req, res);
      const ipAddress = req.ip || 'Unknown IP';
      await logUserActivity(req.user.id, 'dataset_upload', `Uploaded dataset: ${req.body.name}`, ipAddress);
  } catch (error) {
      next(error);
  }
});


// Delete a dataset by ID
router.delete('/:datasetId', verifyToken, isAdmin, async (req, res, next) => {
  try {
      await deleteDataset(req, res);
      const ipAddress = req.ip || 'Unknown IP';
  } catch (error) {
      next(error);
  }
});


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
router.get('/:datasetId/entries', verifyToken, async (req, res, next) => {
  try {
      await getDatasetEntries(req, res);
      const { datasetId } = req.params;
      // Fetch the dataset to check if it exists
      const dataset = await Datasets.findByPk(datasetId);
      if (!dataset) {
          return res.status(404).json({ message: 'Dataset not found' });
      }

      const ipAddress = req.ip || 'Unknown IP';

  } catch (error) {
      next(error);
  }
});


export default router;
