const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expense.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Apply auth middleware to all expense routes
router.use(verifyToken);

// Expense routes
router.post('/', expenseController.createExpense);
router.get('/', expenseController.getAllExpenses);
router.get('/summary', expenseController.getSummaryByCategory);
router.get('/monthly', expenseController.getMonthlyExpenses);
router.get('/:id', expenseController.getExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router; 