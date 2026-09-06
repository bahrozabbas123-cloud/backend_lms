// Day 4: Database Setup - connects the app to PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

 console.log('DB URL:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Fallback individual settings if DATABASE_URL is not used
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected database error', err);
});

module.exports = pool;
