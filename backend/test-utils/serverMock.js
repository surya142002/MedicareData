import express from 'express';
import userRoutes from '../routes/userRoutes.js';

// Create a mock app
const app = express();
app.use(express.json());
app.use('/api/auth', userRoutes); // Only include routes you are testing

export default app;