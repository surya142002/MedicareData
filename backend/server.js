console.log('Starting server...');
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import pkg from 'body-parser';
const { json } = pkg;
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middleware
app.use(pkg.json()); // Parse JSON request bodies
app.use('/api/auth', authRoutes); // Use authRoutes for /api/auth


// Start Server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));