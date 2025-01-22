import jwt from 'jsonwebtoken';
import { verifyToken, isAdmin } from '../middleware/userMiddleware.js';
import express from 'express';
import request from 'supertest';

// Mock the JWT secret environment variable
process.env.JWT_SECRET = 'test-secret';

// Mock routes to test middleware
const app = express();
app.use(express.json());

// Mock route for testing verifyToken
app.get('/protected', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Access granted', user: req.user });
});

// Mock route for testing isAdmin
app.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin access granted' });
});

describe('Middleware Tests', () => {
  describe('verifyToken', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
    });
      
    afterEach(() => {
        jest.restoreAllMocks(); // Restore console.error after tests
    });

    test('Returns 401 if no token is provided', async () => {
      const res = await request(app).get('/protected');
      expect(res.status).toBe(401);
      expect(res.body.message).toBe('Unauthorized: No token provided');
    });

    test('Returns 403 if token is invalid', async () => {
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token');
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Forbidden: Invalid token');
    });

    test('Allows access with a valid token', async () => {
      const validToken = jwt.sign({ id: 'user-id', role: 'user' }, process.env.JWT_SECRET);
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Access granted');
      expect(res.body.user).toEqual(expect.objectContaining({ id: 'user-id', role: 'user' }));
    });
  });

  describe('isAdmin', () => {
    test('Returns 403 if user is not an admin', async () => {
      const userToken = jwt.sign({ id: 'user-id', role: 'user' }, process.env.JWT_SECRET);
      const res = await request(app)
        .get('/admin')
        .set('Authorization', `Bearer ${userToken}`);
      expect(res.status).toBe(403);
      expect(res.body.message).toBe('Forbidden: Admins only');
    });

    test('Allows access if user is an admin', async () => {
      const adminToken = jwt.sign({ id: 'admin-id', role: 'admin' }, process.env.JWT_SECRET);
      const res = await request(app)
        .get('/admin')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Admin access granted');
    });
  });
});
