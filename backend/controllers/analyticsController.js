import UserActivity from '../models/userActivity.js';
import DatasetUsage from '../models/datasetUsage.js';

/**
 * Logs user activity (e.g., login, dataset view, etc.).
 *
 * @param {string} userId - ID of the user performing the action.
 * @param {string} actionType - Type of action performed.
 * @param {string} actionDetails - Details of the action performed.
 * @param {string} ipAddress - IP address of the user.
 */
export const logUserActivity = async (userId, actionType, actionDetails, ipAddress) => {
    try {
        if (!userId || !actionType) {
            throw new Error('userId and actionType are required to log user activity.');
        }
        const normalizedIp = ipAddress.startsWith('::ffff:') ? ipAddress.slice(7) : ipAddress;
        /*
        console.log('Creating User Activity:', {
            user_id: userId,
            action_type: actionType,
            action_details: actionDetails,
            ip_address: normalizedIp || 'Unknown IP',
        });
        */
        await UserActivity.create({
            user_id: userId,
            action_type: actionType,
            action_details: actionDetails,
            ip_address: normalizedIp || 'Unknown IP',
        });
    } catch (error) {
        console.error('Error logging user activity:', error.message);
        throw error; // Ensure errors are caught in the calling function
    }
};


/**
 * Fetches user activity logs with pagination.
 * - Returns recent user actions including email and IP address.
 *
 * @param {object} req - HTTP request containing pagination details.
 * @param {object} res - HTTP response object.
 */
export const getUserActivity = async (req, res) => {
    try {
        // Fetch user activity logs with user details
        const userActivity = await UserActivity.findAll({
            include: {
                model: User,
                as: 'user', // Specify the alias
                attributes: ['email'],
            },
            order: [['timestamp', 'DESC']],
            limit: 100,
        });
        // Format the logs for response
        const formattedLogs = userActivity.map(activity => ({
            id: activity.id,
            email: activity.user?.email || 'Unknown',
            action_type: activity.action_type,
            action_details: activity.action_details,
            timestamp: activity.timestamp,
        }));

        // Log and send the formatted logs
        console.log('User Activity Logs:', formattedLogs);
        res.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching user activity logs:', error.message);
        res.status(500).json({ message: 'Failed to fetch user activity logs', error: error.message });
    }
};



/**
 * Logs dataset usage, such as uploads or searches.
 * @param {UUID} datasetId - The ID of the dataset being interacted with.
 * @param {string} actionType - The type of action performed (e.g., 'upload', 'search').
 * @param {string} [searchTerm] - The search term used (optional).
 * @param {UUID} [userId] - The ID of the user performing the action (optional).
 * @returns {boolean} - True if logging was successful, false otherwise.
 */
export const logDatasetUsage = async (datasetId, actionType, searchTerm = null, userId = null) => {
    try {


        console.log('Creating Dataset Usage:', {
            dataset_id: datasetId,
            action_type: actionType,
            search_term: searchTerm,
            user_id: userId,
        });


        // Log the dataset usage
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




/**
 * Fetches dataset usage logs for the admin dashboard.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const getDatasetUsage = async (req, res) => {
    try {
        // Fetch dataset usage logs with dataset details
        const datasetUsage = await DatasetUsage.findAll({
            include: {
                model: Datasets,
                as: 'dataset', // Specify the alias
                attributes: ['name'],
            },
            order: [['timestamp', 'DESC']],
            limit: 100,
        });

        // Format the logs for response
        const formattedLogs = datasetUsage.map(usage => ({
            id: usage.id,
            dataset_name: usage.dataset?.name || 'Unknown',
            action_type: usage.action_type,
            search_term: usage.search_term,
            usage_count: usage.usage_count,
            timestamp: usage.timestamp,
        }));

        // Log and send the formatted logs
        console.log('Dataset Usage Logs:', formattedLogs);
        res.json(formattedLogs);
    } catch (error) {
        console.error('Error fetching dataset usage logs:', error.message);
        res.status(500).json({ message: 'Failed to fetch dataset usage logs', error: error.message });
    }
};
