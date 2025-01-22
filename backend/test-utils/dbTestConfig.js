import { Sequelize } from 'sequelize';

// Use 'memory' mode explicitly and avoid the deprecated URL
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // In-memory storage
  logging: false, // Disable logging for clean test output
});

export default sequelize;
