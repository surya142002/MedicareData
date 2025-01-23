import sequelize from "../config/db.js"; // Import Sequelize instance
import initModels from "./initModels.js"; // Import model initializer

// Initialize models
const models = initModels(sequelize);

// Export models and Sequelize instance
export default models;
export { sequelize };
