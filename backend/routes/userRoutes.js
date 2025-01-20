import express from 'express';
import jwt from 'jsonwebtoken';
import { register, login } from '../controllers/userController.js';
import { logUserActivity } from '../controllers/analyticsController.js'; // Import logUserActivity

// Create a new router
const router = express.Router();

// User registration route
router.post('/register', async (req, res, next) => {
    try {
        const { user } = await register(req, res);
        const ipAddress = req.ip || 'Unknown IP';
        await logUserActivity(req.body.id, 'register', 'User registered', ipAddress);
    } catch (error) {
        next(error);
    }
});


// User login route
router.post('/login', login);


// Token validation route
router.get('/validate', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (error) {
        console.error('Token validation failed:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});

export default router;
