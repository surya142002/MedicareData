import sequelize from '../config/db.js'; // Import your Sequelize instance
import { User } from './user.js';
import { Dataset } from './dataset.js';
import { ICD10CM } from './icd10cm.js';

// Add models to the database object
const db = {};
db.sequelize = sequelize;
db.User = User;
db.Dataset = Dataset;
db.ICD10CM = ICD10CM;

// Define relationships
Dataset.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });
User.hasMany(Dataset, { foreignKey: 'uploaded_by', as: 'datasets' });

// Sync models with the database
sequelize.sync()
  .then(() => console.log('Database synced.'))
  .catch((err) => console.error('Error syncing database:', err));

// Export the database object and models
export default db;
export { sequelize, Dataset, ICD10CM, User }; // Ensure models are individually exportable
