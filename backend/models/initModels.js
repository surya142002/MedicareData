import User from './user.js';
import Datasets from './dataset.js';
import DatasetEntries from './datasetEntries.js';
import DatasetUsage from './datasetUsage.js';
import UserActivity from './userActivity.js';

/**
 * Initializes and defines associations between all models.
 *
 * @param {Object} sequelize - The Sequelize instance to initialize models with.
 * @returns {Object} The initialized models.
 */
export default function initModels(sequelize) {
    // Initialize models
    User.initModel(sequelize);
    Datasets.initModel(sequelize);
    DatasetEntries.initModel(sequelize);
    DatasetUsage.initModel(sequelize);
    UserActivity.initModel(sequelize);

    // model assosiations

    // Datasets and Users
    Datasets.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
    User.hasMany(Datasets, { foreignKey: 'uploaded_by', as: 'datasets' });

    // Datasets and DatasetEntries
    Datasets.hasMany(DatasetEntries, { foreignKey: 'dataset_id', onDelete: 'CASCADE', as: 'entries' });
    DatasetEntries.belongsTo(Datasets, { foreignKey: 'dataset_id', as: 'dataset' });

    // Users and UserActivity
    UserActivity.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    User.hasMany(UserActivity, { foreignKey: 'user_id', as: 'activities' });

    // Datasets and DatasetUsage
    DatasetUsage.belongsTo(Datasets, { foreignKey: 'dataset_id', as: 'dataset' });
    Datasets.hasMany(DatasetUsage, { foreignKey: 'dataset_id', as: 'usageLogs' });

    return { User, Datasets, DatasetEntries, DatasetUsage, UserActivity };
}
