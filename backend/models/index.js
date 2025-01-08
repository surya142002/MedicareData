const sequelize = require('../config/db.js');
const User = require('./user.js');

const db = {};
db.sequelize = sequelize;
db.User = User;

// Sync models with database
db.sequelize.sync()
  .then(() => console.log('Database synced.'))
  .catch((err) => console.log('Error syncing database: ' + err));

module.exports = db;
