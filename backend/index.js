const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const expenseRoutes = require('./routes/expense');
const budgetRoutes = require('./routes/budget');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration - allow any localhost origin during development
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins regardless of port
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    
    // If deploying to production, you can add specific domains here
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Welcome route to verify the server is running
app.get('/', (req, res) => {
  res.json({ 
    message: 'Daily Expense Tracker API is running',
    status: 'ok',
    serverTime: new Date().toISOString()
  });
});

// Connect to MongoDB
console.log('Connecting to MongoDB...');
console.log(`Connection string: ${process.env.MONGODB_URI ? '(configured)' : '(missing)'}`);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully');
    console.log('Database: ' + (process.env.MONGODB_URI.includes('localhost') ? 'Local MongoDB' : 'MongoDB Atlas'));
    
    // Only set up routes and start server after successful DB connection
    setupRoutesAndStartServer();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Please check your MongoDB connection string in .env file');
    console.error('Make sure MongoDB is running if using a local connection');
    
    // Exit with failure for clear error indication
    process.exit(1);
  });

function setupRoutesAndStartServer() {
  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/expenses', expenseRoutes);
  app.use('/api/budgets', budgetRoutes);
  
  // Basic route for testing connection
  app.get('/api', (req, res) => {
    res.json({ 
      message: 'Daily Expense Tracker API is available',
      status: 'ok',
      serverTime: new Date().toISOString()
    });
  });
  
  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend')));
    
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
    });
  }
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'production' ? null : err.message
    });
  });
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
} 