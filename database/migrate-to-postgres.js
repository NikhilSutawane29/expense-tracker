const { Pool } = require('pg');
require('dotenv').config();

// Define the schema for PostgreSQL
const createTablesQueries = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Categories table
  `CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  // Expenses table
  `CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id),
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
];

// Default categories to seed
const defaultCategories = [
  { name: 'Food & Dining', icon: 'fa-utensils' },
  { name: 'Transportation', icon: 'fa-car' },
  { name: 'Shopping', icon: 'fa-shopping-bag' },
  { name: 'Entertainment', icon: 'fa-film' },
  { name: 'Housing', icon: 'fa-home' },
  { name: 'Utilities', icon: 'fa-bolt' },
  { name: 'Healthcare', icon: 'fa-medkit' },
  { name: 'Personal Care', icon: 'fa-user' },
  { name: 'Education', icon: 'fa-graduation-cap' },
  { name: 'Travel', icon: 'fa-plane' },
  { name: 'Gifts & Donations', icon: 'fa-gift' },
  { name: 'Business', icon: 'fa-briefcase' },
  { name: 'Other', icon: 'fa-question-circle' }
];

async function migrateDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432, // PostgreSQL default port
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Starting database migration to PostgreSQL...');
    
    // Create tables
    for (const query of createTablesQueries) {
      await pool.query(query);
      console.log('Table created successfully');
    }
    
    // Insert default categories
    for (const category of defaultCategories) {
      await pool.query(
        'INSERT INTO categories (name, icon) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING',
        [category.name, category.icon]
      );
    }
    
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Error migrating database:', error);
  } finally {
    await pool.end();
  }
}

migrateDatabase(); 