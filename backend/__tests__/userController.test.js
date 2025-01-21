import request from 'supertest';
import app from '../test-utils/serverMock.js';
import { MockUser } from '../test-utils/mockDb.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../models/user.js', () => require('../test-utils/mockDb').MockUser);
jest.mock('bcrypt', () => ({
    hash: jest.fn(async () => '$2b$10$hashedpassword'),
    compare: jest.fn(async (password, hash) => password === 'password'),
}));
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mocked-jwt-token'),
    verify: jest.fn(() => ({ id: 'mock-id', role: 'user' })),
}));

describe('User Controller', () => {
    beforeEach(() => {
        MockUser.$clearQueue();
        jest.clearAllMocks();
    });

    test('Register a new user successfully', async () => {
        const res = await request(app).post('/api/auth/register').send({
            email: 'newuser@example.com',
            password: 'password',
        });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User registered successfully');
        expect(res.body.user).toHaveProperty('email', 'newuser@example.com');
    });

    test('Fail registration for existing user email', async () => {
        MockUser.findOne.mockResolvedValue(MockUser.build({ email: 'test@example.com' }));
        const res = await request(app).post('/api/auth/register').send({
            email: 'test@example.com',
            password: 'password',
        });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('User already exists.');
    });

    test('Login successfully with correct credentials', async () => {
        MockUser.findOne.mockResolvedValue(MockUser.build({ password_hash: '$2b$10$hashedpassword' }));
        const res = await request(app).post('/api/auth/login').send({
            email: 'test@example.com',
            password: 'password',
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(jwt.sign).toHaveBeenCalled();
    });

    test('Fail login with incorrect credentials', async () => {
        MockUser.findOne.mockResolvedValue(MockUser.build({ password_hash: '$2b$10$hashedpassword' }));
        bcrypt.compare.mockResolvedValue(false);
        const res = await request(app).post('/api/auth/login').send({
            email: 'test@example.com',
            password: 'wrongpassword',
        });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Invalid email or password');
    });
});
