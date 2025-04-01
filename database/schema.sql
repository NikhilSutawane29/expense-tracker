-- Create the database
CREATE DATABASE IF NOT EXISTS expense_tracker;

-- Use the database
USE expense_tracker;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create expense categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO categories (name, description) VALUES
    ('Food', 'Expenses related to groceries and eating out'),
    ('Transportation', 'Expenses for commuting, fuel, etc.'),
    ('Housing', 'Rent, utilities, maintenance'),
    ('Healthcare', 'Medical expenses, medicines'),
    ('Entertainment', 'Movies, events, subscriptions'),
    ('Shopping', 'Clothing, electronics, etc.'),
    ('Education', 'Books, courses, tuition fees'),
    ('Personal Care', 'Grooming, fitness'),
    ('Bills', 'Regular bill payments'),
    ('Others', 'Miscellaneous expenses');

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category_id INT NOT NULL,
    date DATE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Sample queries for reference

-- Add a new user
-- INSERT INTO users (name, email, password) VALUES ('John Doe', 'john@example.com', 'hashed_password');

-- Add a new expense
-- INSERT INTO expenses (user_id, amount, category_id, date, description) 
-- VALUES (1, 500.00, 1, '2023-01-01', 'Grocery shopping');

-- Get all expenses for a user
-- SELECT e.id, e.amount, c.name as category, e.date, e.description 
-- FROM expenses e
-- JOIN categories c ON e.category_id = c.id
-- WHERE e.user_id = 1
-- ORDER BY e.date DESC;

-- Get expenses by category for a user
-- SELECT c.name as category, SUM(e.amount) as total_amount
-- FROM expenses e
-- JOIN categories c ON e.category_id = c.id
-- WHERE e.user_id = 1
-- GROUP BY c.name
-- ORDER BY total_amount DESC; 