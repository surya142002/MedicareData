require('dotenv').config(); // Load .env variables
const { Pool } = require('pg'); // Import PostgreSQL client

// Create a connection pool using .env variables
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test the connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to the database successfully!');
    client.release(); // Release the connection
    pool.end(); // Close the connection pool
  })
  .catch(err => {
    console.error('❌ Error connecting to the database:', err.message);
    pool.end(); // Close the connection pool on error
  });
