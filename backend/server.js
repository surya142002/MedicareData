import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import sequelize from './config/db.js'; // Correct Sequelize instance
import initModels from './models/initModels.js'; // Model initialization
import userRoutes from './routes/userRoutes.js';
import datasetRoutes from './routes/datasetRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js'; // Import analytics routes

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());

// Initialize models
const models = initModels(sequelize);

// Test database connection
sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.error('Error connecting to database:', err));

// Synchronize models with the database
sequelize.sync({ alter: true }) // Use alter to avoid data loss
  .then(() => console.log('Models synchronized with database.'))
  .catch(err => console.error('Error synchronizing models:', err));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/analytics', analyticsRoutes); // Add analytics routes

// Start server
const PORT = process.env.PORT || 5452;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
