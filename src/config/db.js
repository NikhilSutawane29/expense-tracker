// Import the database adapter
const db = require('../../database/db-adapter');
require('dotenv').config();

// Test database connection
const testConnection = async () => {
  try {
    await db.query('SELECT 1');
    console.log('Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

module.exports = {
  pool: db, // Export the adapter as pool to maintain compatibility
  testConnection
}; 