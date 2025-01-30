import { Sequelize } from "sequelize";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize Sequelize with Heroku PostgreSQL connection
const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name from env
  process.env.DB_USER, // Database user from env
  process.env.DB_PASS, // Database password from env
  {
    host: process.env.DB_HOST, // Heroku database host
    dialect: process.env.DB_DIALECT || "postgres", // Default to PostgreSQL
    port: process.env.DB_PORT || 5432, // Default port
    dialectOptions: {
      ssl: {
        require: true, // Heroku Postgres requires SSL
        rejectUnauthorized: false, // Allow self-signed certificates
      },
    },
    logging: false, // Turn off logging in production
  }
);

export default sequelize;
