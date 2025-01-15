import express from 'express';
import UserActivity from '../models/userActivity.js';
import DatasetUsage from '../models/datasetUsage.js';
import { Op } from 'sequelize';

const router = express.Router();

// Fetch user activity logs
router.get('/user-activity', async (req, res) => {
    try {
        const logs = await UserActivity.findAll({
            attributes: ['action_type', 'action_details', 'timestamp', 'ip_address'],
            include: [
                {
                    model: User,
                    attributes: ['email'], // Include user email
                },
            ],
            order: [['timestamp', 'DESC']],
            limit: 100,
        });

        res.json(logs.map(log => ({
            actionType: log.action_type,
            actionDetails: log.action_details,
            timestamp: log.timestamp,
            ipAddress: log.ip_address,
            userEmail: log.User.email, // Include user email in the response
        })));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch user activity logs', error: error.message });
    }
});


// Fetch dataset usage statistics
router.get('/dataset-usage', async (req, res) => {
    try {
        const usage = await DatasetUsage.findAll({
            attributes: ['action_type', 'search_term', 'usage_count', 'timestamp'],
            include: [
                {
                    model: Datasets,
                    attributes: ['name'], // Include dataset name
                },
            ],
            order: [['timestamp', 'DESC']],
            limit: 100,
        });

        res.json(usage.map(record => ({
            datasetName: record.Dataset.name, // Include dataset name
            actionType: record.action_type,
            searchTerm: record.search_term,
            usageCount: record.usage_count,
            timestamp: record.timestamp,
        })));
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dataset usage', error: error.message });
    }
});


export default router;
