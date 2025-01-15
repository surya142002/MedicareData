import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { logUserActivity } from './analyticsController.js'; // Import logUserActivity

// Register a new user
export const register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            password_hash: hashedPassword,
            role: 'user',
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: user.id, email: user.email, role: user.role },
        });

        return { user }; // Return user for logging
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'An error occurred', error: err.message });
    }
};


// Login user
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = user.password_hash
            ? await bcrypt.compare(password, user.password_hash)
            : false;

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'Unknown IP';
        await logUserActivity(user.id, 'login', 'User logged in', ipAddress);

        // Send response here
        return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Error during login:', error.message);
        return res.status(500).json({ message: 'An error occurred during login', error: error.message });
    }
};


// Token validation
export const validateToken = (req, res) => {
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
};
