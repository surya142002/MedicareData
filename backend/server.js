import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import sequelize from './config/db.js'; // Correct Sequelize instance
import initModels from './models/initModels.js'; // Model initialization
import authRoutes from './routes/authRoutes.js';
import datasetRoutes from './routes/datasets.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(bodyParser.json());

// Initialize models
const models = initModels(sequelize);

// Test database connection
sequelize.authenticate()
    .then(() => console.log('Database connected...'))
    .catch(err => console.error('Error connecting to database:', err));

// Synchronize models with the database
sequelize.sync({ alter: true }) // Use { force: true } cautiously
    .then(() => console.log('Models synchronized with database.'))
    .catch(err => console.error('Error synchronizing models:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', datasetRoutes);

// Start server
const PORT = process.env.PORT || 5452;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
