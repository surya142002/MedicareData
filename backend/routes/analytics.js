import express from 'express';
import UserActivity from '../models/userActivity.js';
import DatasetUsage from '../models/datasetUsage.js';
import User from '../models/user.js'; // Import User model
import Datasets from '../models/dataset.js'; // Import Datasets model

const router = express.Router();

// Fetch user activity logs with pagination
router.get('/user-activity', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query; // Default to page 1, 10 items per page
        const offset = (page - 1) * limit;

        const logs = await UserActivity.findAndCountAll({
            attributes: ['action_type', 'action_details', 'timestamp', 'ip_address'],
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['email'],
                },
            ],
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });

        res.json({
            total: logs.count,
            totalPages: Math.ceil(logs.count / limit),
            currentPage: parseInt(page, 10),
            data: logs.rows.map(log => ({
                actionType: log.action_type,
                actionDetails: log.action_details,
                timestamp: log.timestamp,
                ipAddress: log.ip_address,
                userEmail: log.user?.email || 'Unknown',
            })),
        });
    } catch (error) {
        console.error('Error fetching user activity logs:', error.message);
        res.status(500).json({ message: 'Failed to fetch user activity logs', error: error.message });
    }
});

// Fetch dataset usage statistics with pagination
router.get('/dataset-usage', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;

        const usage = await DatasetUsage.findAndCountAll({
            attributes: ['action_type', 'search_term', 'usage_count', 'timestamp'],
            include: [
                {
                    model: Datasets,
                    as: 'dataset',
                    attributes: ['name'],
                },
            ],
            order: [['timestamp', 'DESC']],
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });

        res.json({
            total: usage.count,
            totalPages: Math.ceil(usage.count / limit),
            currentPage: parseInt(page, 10),
            data: usage.rows.map(record => ({
                datasetName: record.dataset?.name || 'Unknown',
                actionType: record.action_type,
                searchTerm: record.search_term,
                usageCount: record.usage_count,
                timestamp: record.timestamp,
            })),
        });
    } catch (error) {
        console.error('Error fetching dataset usage:', error.message);
        res.status(500).json({ message: 'Failed to fetch dataset usage', error: error.message });
    }
});


export default router;
