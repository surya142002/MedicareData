import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      dialect: 'postgres',
      port: process.env.DB_PORT || 5432,
    }
  );

export default sequelize;