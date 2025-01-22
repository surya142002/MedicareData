import { models } from '../test-utils/jest.setup.js';
import request from 'supertest';
import app from '../test-utils/serverMock.js';

jest.mock('../middleware/userMiddleware.js', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'mock-user-id', role: 'admin' }; // Mocked user
    next();
  },
  isAdmin: (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
  },
}));

const { User, UserActivity, DatasetUsage, Datasets } = models;

describe('Analytics Controller', () => {
  let user;

  beforeEach(async () => {
    jest.clearAllMocks();
    await UserActivity.destroy({ where: {}, truncate: false });
    await DatasetUsage.destroy({ where: {}, truncate: false });
    await Datasets.destroy({ where: {}, truncate: false });
    await User.destroy({ where: {}, truncate: false });

    // Create a user for testing
    user = await User.create({
      id: 'mock-user-id',
      email: 'testuser@example.com',
      password_hash: '$2b$10$hashedpassword',
      role: 'user',
    });
  });

  describe('logUserActivity', () => {
    test('Logs user activity successfully', async () => {
      await UserActivity.create({
        user_id: user.id,
        action_type: 'login',
        action_details: 'User logged in',
        ip_address: '127.0.0.1',
      });

      const activity = await UserActivity.findOne({ where: { user_id: user.id } });
      expect(activity).not.toBeNull();
      expect(activity.action_type).toBe('login');
      expect(activity.action_details).toBe('User logged in');
    });
  });

  describe('getUserActivity', () => {
    test('Fetches user activity logs', async () => {
      await UserActivity.create({
        user_id: user.id,
        action_type: 'login',
        action_details: 'User logged in',
        ip_address: '127.0.0.1',
      });

      const res = await request(app)
        .get('/api/analytics/user-activity')
        .set('Authorization', `Bearer mocked-jwt-token`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].userEmail).toBe(user.email);
      expect(res.body.data[0].actionType).toBe('login');
    });
  });

  describe('logDatasetUsage', () => {
    test('Logs dataset usage successfully', async () => {
      const dataset = await Datasets.create({
        id: 'mock-dataset-id',
        name: 'Test Dataset',
        description: 'Sample dataset description',
        type: 'ICD-10-CM',
        uploaded_by: user.id,
      });

      await DatasetUsage.create({
        dataset_id: dataset.id,
        action_type: 'search',
        search_term: 'diabetes',
        user_id: user.id,
      });

      const usage = await DatasetUsage.findOne({ where: { dataset_id: dataset.id } });
      expect(usage).not.toBeNull();
      expect(usage.action_type).toBe('search');
      expect(usage.search_term).toBe('diabetes');
    });
  });

  describe('getDatasetUsage', () => {
    test('Fetches dataset usage logs', async () => {
      const dataset = await Datasets.create({
        id: 'mock-dataset-id',
        name: 'Test Dataset',
        description: 'Sample dataset description',
        type: 'ICD-10-CM',
        uploaded_by: user.id,
      });

      await DatasetUsage.create({
        dataset_id: dataset.id,
        action_type: 'search',
        search_term: 'diabetes',
        user_id: user.id,
      });

      const res = await request(app)
        .get('/api/analytics/dataset-usage')
        .set('Authorization', `Bearer mocked-jwt-token`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].datasetName).toBe('Test Dataset');
      expect(res.body.data[0].actionType).toBe('search');
    });
  });
});
