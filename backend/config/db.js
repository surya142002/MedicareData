import { Sequelize } from 'sequelize';

// Initialize Sequelize
const sequelize = new Sequelize('medidatabase', 'surya', 'password1', {
    host: 'localhost',
    dialect: 'postgres',
});

export default sequelize;
