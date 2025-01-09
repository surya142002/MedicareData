import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import datasetRoutes from './routes/datasets.js'; // Import datasets routes
import sequelize from './config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' })); // Allow requests from frontend
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', datasetRoutes); // Register datasets routes

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.error('Error connecting to database:', err));

// Synchronize models with the database
sequelize.sync({ alter: true }) // Use { force: true } cautiously (drops and recreates tables)
  .then(() => console.log('Models synchronized with database.'))
  .catch((err) => console.error('Error synchronizing models:', err));

// Start server
const PORT = process.env.PORT || 5452;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
