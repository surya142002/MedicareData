import express from 'express';
import userRoutes from '../routes/userRoutes.js';
import analyticsRoutes from '../routes/analyticsRoutes.js';
import datasetRoutes from '../routes/datasetRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/datasets', datasetRoutes);

export default app;
