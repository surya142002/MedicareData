import SequelizeMock from 'sequelize-mock';
import { v4 as uuidv4 } from 'uuid'; // Import the UUID library

const dbMock = new SequelizeMock();

// Mock User Model
const MockUser = dbMock.define('User', {
  id: 'e1373c13-9c14-4e7c-9fd5-3b8bfb7a81a0', // Replace with a valid UUID
  email: 'test@example.com',
  password_hash: '$2b$10$hashedpassword',
  role: 'user',
});

MockUser.findOne = jest.fn(async (query) => {
    if (query.where?.email === 'test@example.com') {
        return MockUser.build({
            id: uuidv4(), // Generate a valid UUID
            email: 'test@example.com',
            password_hash: '$2b$10$hashedpassword',
            role: 'user',
        });
    }
    return null;
});

MockUser.create = jest.fn(async (data) => {
    return MockUser.build({
        ...data,
        id: uuidv4(), // Generate a valid UUID for the mock user
    });
});

// Mock UserActivity Model
let activityIdCounter = 1;
const MockUser = dbMock.define('User', {
  id: 'e1373c13-9c14-4e7c-9fd5-3b8bfb7a81a0', // Replace with a valid UUID
  email: 'test@example.com',
  password_hash: '$2b$10$hashedpassword',
  role: 'user',
});

const MockUserActivity = dbMock.define('UserActivity', {
  id: 'e1373c13-9c14-4e7c-9fd5-3b8bfb7a81a0', // Replace with a valid UUID
  user_id: 'e1373c13-9c14-4e7c-9fd5-3b8bfb7a81a0',
  action_type: 'register',
  action_details: 'User registered',
  ip_address: '::1',
});


MockUserActivity.create = jest.fn(async (data) => {
    if (!data.user_id || !data.action_type) {
        throw new Error('user_id and action_type are required');
    }
    return MockUserActivity.build({
        id: uuidv4(), // Generate a valid UUID for each mock activity
        ...data,
    });
});

MockUserActivity.findAll = jest.fn(async () => [
    MockUserActivity.build({
        id: uuidv4(), // Generate a valid UUID
        user_id: uuidv4(),
        action_type: 'register',
        action_details: 'User registered',
        ip_address: '::1',
    }),
]);

MockUserActivity.findAndCountAll = jest.fn(async () => ({
    rows: [
        MockUserActivity.build({
            id: uuidv4(), // Generate a valid UUID
            user_id: uuidv4(),
            action_type: 'register',
            action_details: 'User registered',
            ip_address: '::1',
        }),
    ],
    count: 1,
}));

export { MockUser, MockUserActivity };
export default dbMock;
