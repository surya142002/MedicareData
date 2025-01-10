import User from './user.js';
import Datasets from './dataset.js';
import DatasetEntries from './datasetEntries.js';

export default function initModels(sequelize) {
    // Initialize models
    User.initModel(sequelize);
    Datasets.initModel(sequelize);
    DatasetEntries.initModel(sequelize);

    // Define relationships
    Datasets.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
    User.hasMany(Datasets, { foreignKey: 'uploaded_by', as: 'datasets' });
    Datasets.hasMany(DatasetEntries, { foreignKey: 'dataset_id', onDelete: 'CASCADE' });
    DatasetEntries.belongsTo(Datasets, { foreignKey: 'dataset_id' });

    return { User, Datasets, DatasetEntries };
}
