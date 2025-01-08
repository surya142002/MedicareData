import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/authRoutes.js';
import sequelize from './config/db.js';
import dotenv from 'dotenv';
// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.error('Error connecting to database:', err));

// Start server
const PORT = process.env.PORT || 5452;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

