import { Sequelize } from 'sequelize';

// Initialize Sequelize
const sequelize = new Sequelize('medidatabase', process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
});

export default sequelize;
