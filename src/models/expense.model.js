const { pool } = require('../config/db');

class Expense {
  static async create(expenseData) {
    const { user_id, amount, category_id, date, description } = expenseData;
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO expenses (user_id, amount, category_id, date, description) VALUES (?, ?, ?, ?, ?)',
        [user_id, amount, category_id, date, description]
      );
      
      return {
        id: result.insertId,
        user_id,
        amount,
        category_id,
        date,
        description
      };
    } catch (error) {
      throw new Error(`Error creating expense: ${error.message}`);
    }
  }
  
  static async findById(id, userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT e.*, c.name as category_name 
         FROM expenses e
         JOIN categories c ON e.category_id = c.id
         WHERE e.id = ? AND e.user_id = ?`,
        [id, userId]
      );
      
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Error finding expense: ${error.message}`);
    }
  }
  
  static async findAllByUser(userId, filters = {}) {
    try {
      let query = `
        SELECT e.*, c.name as category_name 
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ?
      `;
      
      const queryParams = [userId];
      
      // Apply filters
      if (filters.startDate && filters.endDate) {
        query += ' AND e.date BETWEEN ? AND ?';
        queryParams.push(filters.startDate, filters.endDate);
      } else if (filters.startDate) {
        query += ' AND e.date >= ?';
        queryParams.push(filters.startDate);
      } else if (filters.endDate) {
        query += ' AND e.date <= ?';
        queryParams.push(filters.endDate);
      }
      
      if (filters.category_id) {
        query += ' AND e.category_id = ?';
        queryParams.push(filters.category_id);
      }
      
      // Sort results
      query += ' ORDER BY e.date DESC';
      
      // Add pagination if provided
      if (filters.limit) {
        query += ' LIMIT ?';
        queryParams.push(parseInt(filters.limit));
        
        if (filters.offset) {
          query += ' OFFSET ?';
          queryParams.push(parseInt(filters.offset));
        }
      }
      
      const [rows] = await pool.execute(query, queryParams);
      return rows;
    } catch (error) {
      throw new Error(`Error retrieving expenses: ${error.message}`);
    }
  }
  
  static async update(id, userId, expenseData) {
    const { amount, category_id, date, description } = expenseData;
    
    try {
      const [result] = await pool.execute(
        `UPDATE expenses 
         SET amount = ?, category_id = ?, date = ?, description = ? 
         WHERE id = ? AND user_id = ?`,
        [amount, category_id, date, description, id, userId]
      );
      
      if (result.affectedRows === 0) {
        return null;
      }
      
      return {
        id,
        user_id: userId,
        amount,
        category_id,
        date,
        description
      };
    } catch (error) {
      throw new Error(`Error updating expense: ${error.message}`);
    }
  }
  
  static async delete(id, userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM expenses WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting expense: ${error.message}`);
    }
  }
  
  static async getSummaryByCategory(userId, startDate, endDate) {
    try {
      const query = `
        SELECT c.id as category_id, c.name as category_name, SUM(e.amount) as total_amount
        FROM expenses e
        JOIN categories c ON e.category_id = c.id
        WHERE e.user_id = ? AND e.date BETWEEN ? AND ?
        GROUP BY c.id, c.name
        ORDER BY total_amount DESC
      `;
      
      const [rows] = await pool.execute(query, [userId, startDate, endDate]);
      return rows;
    } catch (error) {
      throw new Error(`Error generating summary: ${error.message}`);
    }
  }
  
  static async getMonthlyExpense(userId, year) {
    try {
      const query = `
        SELECT MONTH(e.date) as month, SUM(e.amount) as total_amount
        FROM expenses e
        WHERE e.user_id = ? AND YEAR(e.date) = ?
        GROUP BY MONTH(e.date)
        ORDER BY month
      `;
      
      const [rows] = await pool.execute(query, [userId, year]);
      return rows;
    } catch (error) {
      throw new Error(`Error generating monthly expense: ${error.message}`);
    }
  }
}

module.exports = Expense; 