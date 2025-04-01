const { pool } = require('../config/db');

class Category {
  static async findAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM categories ORDER BY name'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error retrieving categories: ${error.message}`);
    }
  }
  
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM categories WHERE id = ?',
        [id]
      );
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error retrieving category: ${error.message}`);
    }
  }
  
  static async create(name, description = '') {
    try {
      const [result] = await pool.execute(
        'INSERT INTO categories (name, description) VALUES (?, ?)',
        [name, description]
      );
      
      return {
        id: result.insertId,
        name,
        description
      };
    } catch (error) {
      throw new Error(`Error creating category: ${error.message}`);
    }
  }
}

module.exports = Category; 