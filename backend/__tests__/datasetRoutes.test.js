import request from 'supertest';
import app from '../test-utils/serverMock.js';
import { models } from '../test-utils/jest.setup.js';
import fs from 'fs';
import path from 'path';

// Mock middleware
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

// Mock file upload
jest.mock('../middleware/uploadMiddleware.js', () => ({
    upload: {
      single: () => (req, res, next) => {
        if (!req.headers['x-mock-no-file']) {
          req.file = {
            path: 'uploads/mock_file.txt',
            originalname: 'mock_file.txt',
            mimetype: 'text/plain',
          }; // Mock uploaded file
        }
        req.body = {
          ...req.body,
          name: req.body.name || 'New Dataset',
          description: req.body.description || 'This is a new dataset.',
          datasetType: req.body.datasetType || 'ICD-10-CM',
        };
        next();
      },
    },
}));
  
  

const { Datasets, DatasetEntries, User } = models;
let user, dataset;

describe('Dataset Routes', () => {
  beforeEach(async () => {
    jest.clearAllMocks();

    // Ensure uploads directory exists
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Create a mock file for the upload
    const filePath = path.join(uploadDir, 'mock_file.txt');
    fs.writeFileSync(filePath, 'mock data content');

    // Clear database tables
    await DatasetEntries.destroy({ where: {}, truncate: false });
    await Datasets.destroy({ where: {}, truncate: false });
    await User.destroy({ where: {}, truncate: false });

    // Create a mock user
    user = await User.create({
      id: 'mock-user-id',
      email: 'testuser@example.com',
      password_hash: '$2b$10$hashedpassword',
      role: 'admin',
    });

    // Create a mock dataset
    dataset = await Datasets.create({
      id: 'mock-dataset-id',
      name: 'Mock Dataset',
      description: 'This is a mock dataset.',
      type: 'ICD-10-CM',
      uploaded_by: user.id,
      uploaded_at: new Date(),
    });
  });

  afterAll(() => {
    const uploadDir = path.join(__dirname, '../uploads');
    fs.rmSync(uploadDir, { recursive: true, force: true });
  });
  

  describe('POST /upload', () => {
    test('Uploads a dataset successfully', async () => {
      const res = await request(app)
        .post('/api/datasets/upload')
        .field('name', 'New Dataset')
        .field('description', 'This is a new dataset.')
        .field('datasetType', 'ICD-10-CM')
        .attach('file', Buffer.from('mock data content'), 'mock_file.txt'); // Simulate file upload
  
      expect(res.status).toBe(201);
      expect(res.body.dataset).toHaveProperty('id'); // Ensure `id` is returned
  
      // Verify dataset was added to the database
      const createdDataset = await Datasets.findOne({ where: { name: 'New Dataset' } });
      expect(createdDataset).not.toBeNull();
      expect(createdDataset.description).toBe('This is a new dataset.');
    });
  
    test('Fails to upload dataset without a file', async () => {
      const res = await request(app)
        .post('/api/datasets/upload')
        .set('x-mock-no-file', 'true') // Simulate no file uploaded
        .field('name', 'Dataset Without File')
        .field('description', 'This should fail.')
        .field('datasetType', 'ICD-10-CM');
  
      expect(res.status).toBe(400);
      expect(res.body.message).toBe('File is required.');
    });
  });
  

  describe('DELETE /:datasetId', () => {
    test('Deletes a dataset successfully', async () => {
      const res = await request(app)
        .delete(`/api/datasets/${dataset.id}`)
        .set('Authorization', 'Bearer mocked-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Dataset deleted successfully');

      // Verify dataset is deleted from the database
      const deletedDataset = await Datasets.findByPk(dataset.id);
      expect(deletedDataset).toBeNull();
    });

    test('Returns 404 for a non-existent dataset', async () => {
      const res = await request(app)
        .delete('/api/datasets/non-existent-id')
        .set('Authorization', 'Bearer mocked-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Dataset not found');
    });
  });

  describe('GET /', () => {
    test('Fetches all datasets metadata', async () => {
      const res = await request(app).get('/api/datasets');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('name', dataset.name);
    });
  });

  describe('GET /:datasetId/entries', () => {
    test('Fetches entries of a dataset successfully', async () => {
      // Add mock entries to the dataset
      await DatasetEntries.bulkCreate([
        { dataset_id: dataset.id, data: { code: 'A01', description: 'Typhoid fever' } },
        { dataset_id: dataset.id, data: { code: 'A02', description: 'Paratyphoid fever' } },
      ]);

      const res = await request(app)
        .get(`/api/datasets/${dataset.id}/entries`)
        .set('Authorization', 'Bearer mocked-jwt-token');

      expect(res.status).toBe(200);
      expect(res.body.entries).toHaveLength(2);
      expect(res.body.entries[0].data.code).toBe('A01');
      expect(res.body.entries[0].data.description).toBe('Typhoid fever');
    });

    test('Returns 404 if dataset is not found', async () => {
      const res = await request(app)
        .get('/api/datasets/non-existent-id/entries')
        .set('Authorization', 'Bearer mocked-jwt-token');

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Dataset not found');
    });
  });
});
