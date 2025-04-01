require('dotenv').config();

let db;

// Determine which database to use based on environment
if (process.env.DATABASE_TYPE === 'postgres') {
  // PostgreSQL setup
  const { Pool } = require('pg');
  
  const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  // Wrapper functions to make API consistent
  db = {
    query: async (sql, params) => {
      // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc. if needed
      let pgSql = sql;
      if (sql.includes('?')) {
        let paramCounter = 0;
        pgSql = sql.replace(/\?/g, () => `$${++paramCounter}`);
      }
      
      const result = await pool.query(pgSql, params);
      return {
        rows: result.rows,
        fields: result.fields
      };
    },
    execute: async (sql, params) => {
      // Convert MySQL ? placeholders to PostgreSQL $1, $2, etc. if needed
      let pgSql = sql;
      if (sql.includes('?')) {
        let paramCounter = 0;
        pgSql = sql.replace(/\?/g, () => `$${++paramCounter}`);
      }
      
      const result = await pool.query(pgSql, params);
      return {
        affectedRows: result.rowCount,
        insertId: result.rows[0]?.id || null
      };
    },
    end: async () => {
      await pool.end();
    }
  };
} else {
  // MySQL setup (default)
  const mysql = require('mysql2/promise');
  
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  
  db = {
    query: async (sql, params) => {
      const [rows, fields] = await pool.query(sql, params);
      return { rows, fields };
    },
    execute: async (sql, params) => {
      const [result] = await pool.execute(sql, params);
      return result;
    },
    end: async () => {
      await pool.end();
    }
  };
}

module.exports = db; 