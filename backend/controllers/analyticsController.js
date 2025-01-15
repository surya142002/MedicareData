import UserActivity from '../models/userActivity.js';
import DatasetUsage from '../models/datasetUsage.js';

// Log user activity
export const logUserActivity = async (userId, actionType, actionDetails, ipAddress) => {
    try {
        console.log('Logging User Activity:', {
            userId,
            actionType,
            actionDetails,
            ipAddress,
        });

        await UserActivity.create({
            user_id: userId,
            action_type: actionType,
            action_details: actionDetails,
            ip_address: ipAddress || 'Unknown IP',
        });
    } catch (error) {
        console.error('Error logging user activity:', error.message);
        throw error; // Throw to ensure errors are caught in the calling function
    }
};




// Log dataset usage
export const logDatasetUsage = async (datasetId, actionType, searchTerm = null, userId = null) => {
    try {
        await DatasetUsage.create({
            dataset_id: datasetId,
            action_type: actionType,
            search_term: searchTerm,
            user_id: userId,
        });
        return true;
    } catch (error) {
        console.error('Error logging dataset usage:', error.message);
        return false;
    }
};

// Fetch user activity logs
export const getUserActivity = async (req, res) => {
    try {
        const userActivity = await UserActivity.findAll({
            include: {
                association: 'user',
                attributes: ['email'], // Include user email
            },
            order: [['timestamp', 'DESC']],
            limit: 100, // Fetch recent 100 logs
        });

        const formattedLogs = userActivity.map(activity => ({
            id: activity.id,
            email: activity.user?.email || 'Unknown',
            action_type: activity.action_type,
            action_details: activity.action_details,
            timestamp: activity.timestamp,
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching user activity logs:', error.message);
        res.status(500).json({ message: 'Failed to fetch user activity logs', error: error.message });
    }
};

// Fetch dataset usage logs
export const getDatasetUsage = async (req, res) => {
    try {
        const datasetUsage = await DatasetUsage.findAll({
            include: {
                association: 'dataset',
                attributes: ['name'], // Include dataset name
            },
            order: [['timestamp', 'DESC']],
            limit: 100, // Fetch recent 100 logs
        });

        const formattedLogs = datasetUsage.map(usage => ({
            id: usage.id,
            dataset_name: usage.dataset?.name || 'Unknown',
            action_type: usage.action_type,
            search_term: usage.search_term,
            usage_count: usage.usage_count,
            timestamp: usage.timestamp,
        }));

        res.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching dataset usage logs:', error.message);
        res.status(500).json({ message: 'Failed to fetch dataset usage logs', error: error.message });
    }
};
