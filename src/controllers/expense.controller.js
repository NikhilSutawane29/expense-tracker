const Expense = require('../models/expense.model');

// Create a new expense
exports.createExpense = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { amount, category_id, date, description } = req.body;
    
    // Validate input
    if (!amount || !category_id || !date) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount, category, and date are required'
      });
    }
    
    // Create new expense
    const newExpense = await Expense.create({
      user_id,
      amount,
      category_id,
      date,
      description: description || ''
    });
    
    res.status(201).json({
      status: 'success',
      message: 'Expense created successfully',
      data: {
        expense: newExpense
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get all expenses for a user
exports.getAllExpenses = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { startDate, endDate, category_id, limit, offset } = req.query;
    
    // Apply filters
    const filters = {};
    
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (category_id) filters.category_id = category_id;
    if (limit) filters.limit = limit;
    if (offset) filters.offset = offset;
    
    // Get expenses
    const expenses = await Expense.findAllByUser(user_id, filters);
    
    res.status(200).json({
      status: 'success',
      results: expenses.length,
      data: {
        expenses
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single expense
exports.getExpense = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    
    // Find expense
    const expense = await Expense.findById(id, user_id);
    
    if (!expense) {
      return res.status(404).json({
        status: 'error',
        message: 'Expense not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        expense
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update an expense
exports.updateExpense = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    const { amount, category_id, date, description } = req.body;
    
    // Validate input
    if (!amount || !category_id || !date) {
      return res.status(400).json({
        status: 'error',
        message: 'Amount, category, and date are required'
      });
    }
    
    // Update expense
    const updatedExpense = await Expense.update(id, user_id, {
      amount,
      category_id,
      date,
      description: description || ''
    });
    
    if (!updatedExpense) {
      return res.status(404).json({
        status: 'error',
        message: 'Expense not found or unauthorized'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Expense updated successfully',
      data: {
        expense: updatedExpense
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete an expense
exports.deleteExpense = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;
    
    // Delete expense
    const result = await Expense.delete(id, user_id);
    
    if (!result) {
      return res.status(404).json({
        status: 'error',
        message: 'Expense not found or unauthorized'
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get expense summary by category
exports.getSummaryByCategory = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date and end date are required'
      });
    }
    
    const summary = await Expense.getSummaryByCategory(user_id, startDate, endDate);
    
    res.status(200).json({
      status: 'success',
      data: {
        summary
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get monthly expenses
exports.getMonthlyExpenses = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { year } = req.query;
    
    if (!year) {
      return res.status(400).json({
        status: 'error',
        message: 'Year is required'
      });
    }
    
    const monthlyData = await Expense.getMonthlyExpense(user_id, year);
    
    res.status(200).json({
      status: 'success',
      data: {
        monthlyData
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 