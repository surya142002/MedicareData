import express from 'express';
import userRoutes from '../routes/userRoutes.js';
import analyticsRoutes from '../routes/analyticsRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', userRoutes);
app.use('/api/analytics', analyticsRoutes);

export default app;
