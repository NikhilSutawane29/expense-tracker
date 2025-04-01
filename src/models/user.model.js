const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    const { name, email, password } = userData;
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      
      return {
        id: result.insertId,
        name,
        email
      };
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }
  
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }
  
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, email, created_at FROM users WHERE id = ?',
        [id]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }
  
  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User; 