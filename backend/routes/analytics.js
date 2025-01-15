import express from 'express';
import UserActivity from '../models/userActivity.js';
import DatasetUsage from '../models/datasetUsage.js';
import { Op } from 'sequelize';

const router = express.Router();

// Fetch user activity logs
router.get('/user-activity', async (req, res) => {
    try {
        const logs = await UserActivity.findAll({
            order: [['timestamp', 'DESC']],
            limit: 100, // Fetch recent 100 logs
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching user activity logs:', error.message);
        res.status(500).json({ message: 'Failed to fetch user activity logs', error: error.message });
    }
});

// Fetch dataset usage statistics
router.get('/dataset-usage', async (req, res) => {
    try {
        const usage = await DatasetUsage.findAll({
            attributes: [
                'dataset_id',
                'action_type',
                'search_term',
                [DatasetUsage.sequelize.fn('COUNT', DatasetUsage.sequelize.col('id')), 'usage_count'],
            ],
            group: ['dataset_id', 'action_type', 'search_term'],
            order: [['usage_count', 'DESC']],
            limit: 100, // Fetch top 100 logs
        });
        res.json(usage);
    } catch (error) {
        console.error('Error fetching dataset usage:', error.message);
        res.status(500).json({ message: 'Failed to fetch dataset usage', error: error.message });
    }
});

export default router;
