import jwt from 'jsonwebtoken';

/**
 * Middleware to verify if a request contains a valid JWT token.
 * - Extracts the token from the Authorization header.
 * - Decodes and validates the token using the secret key.
 * - Attaches the decoded user information to the request object if valid.
 * - Returns a 401 Unauthorized error if the token is missing or invalid.
 */
export const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user information to the request
        next();
    } catch (error) {
        console.error('Error verifying token:', error.message);
        res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
};

/**
 * Middleware to check if the authenticated user has the admin role.
 * - Assumes the `verifyToken` middleware has run prior and attached the user info to `req.user`.
 * - Verifies the user's role is 'admin'.
 * - Returns a 403 Forbidden error if the user is not an admin.
 */
export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
};