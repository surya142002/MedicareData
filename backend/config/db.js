import { Sequelize } from 'sequelize';

// Initialize Sequelize instance
// This creates a connection to the PostgreSQL database with the specified configurations.
const sequelize = new Sequelize(
    'medidatabase', 
    process.env.DB_USER, 
    process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
});

// Export the Sequelize instance for use in other parts of the application
// This instance is used to define and interact with database models.
export default sequelize;
