import { MockUser } from '../test-utils/mockDb';

jest.mock('../models/initModels', () => jest.fn(() => ({
  User: require('../test-utils/mockDb').MockUser,
  UserActivity: require('../test-utils/mockDb').MockUserActivity,
})));

export default {
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.js'],
};
