import User from './user.js';
import Datasets from './dataset.js';
import DatasetEntries from './datasetEntries.js';
import DatasetUsage from './datasetUsage.js';
import UserActivity from './userActivity.js';

export default function initModels(sequelize) {
    // Initialize models
    User.initModel(sequelize);
    Datasets.initModel(sequelize);
    DatasetEntries.initModel(sequelize);
    DatasetUsage.initModel(sequelize);
    UserActivity.initModel(sequelize);

    // Define relationships
    Datasets.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
    User.hasMany(Datasets, { foreignKey: 'uploaded_by', as: 'datasets' });

    Datasets.hasMany(DatasetEntries, { foreignKey: 'dataset_id', onDelete: 'CASCADE', as: 'entries' });
    DatasetEntries.belongsTo(Datasets, { foreignKey: 'dataset_id', as: 'dataset' });

    UserActivity.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    User.hasMany(UserActivity, { foreignKey: 'user_id', as: 'activities' });

    DatasetUsage.belongsTo(Datasets, { foreignKey: 'dataset_id', as: 'dataset' });
    Datasets.hasMany(DatasetUsage, { foreignKey: 'dataset_id', as: 'usageLogs' });

    return { User, Datasets, DatasetEntries, DatasetUsage, UserActivity };
}
