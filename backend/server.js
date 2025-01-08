console.log('Starting server...');

const express = require('express');
require('dotenv').config(); // Load .env file

const app = express();

// Middleware
app.use(express.json());

// Access environment variables
const port = process.env.PORT || 6969;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;


// Example database configuration
const dbConfig = {
  user: dbUser,
  password: dbPassword,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
};

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Sample API route
app.get('/api/datasets', (req, res) => {
  const datasets = [
      { id: 1, name: 'ICD-10-CM' },
      { id: 2, name: 'HCPCS' },
      { id: 3, name: 'RVU' },
  ];
  res.json(datasets);
});
