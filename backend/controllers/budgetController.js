const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

// Get all budgets for a user for current month and year or specified month and year
exports.getBudgets = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const currentMonth = month ? parseInt(month) : currentDate.getMonth();
    const currentYear = year ? parseInt(year) : currentDate.getFullYear();

    const budgets = await Budget.find({
      user: req.user.id,
      month: currentMonth,
      year: currentYear
    });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new budget
exports.createBudget = async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    
    // Check if budget already exists for this category, month and year
    const existingBudget = await Budget.findOne({
      user: req.user.id,
      category,
      month,
      year
    });

    if (existingBudget) {
      return res.status(400).json({
        success: false,
        message: 'Budget already exists for this category in selected month/year'
      });
    }

    const budget = await Budget.create({
      user: req.user.id,
      category,
      amount,
      month,
      year
    });

    res.status(201).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a budget
exports.updateBudget = async (req, res) => {
  try {
    const { amount } = req.body;

    // Find and update the budget
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      { amount },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if the budget belongs to the user
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this budget'
      });
    }

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Check if the budget belongs to the user
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get budget summary with current spending
exports.getBudgetSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetMonth = month ? parseInt(month) : currentDate.getMonth();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get all budgets for the month/year
    const budgets = await Budget.find({
      user: req.user.id,
      month: targetMonth,
      year: targetYear
    });

    // Get start and end date for the month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);

    // Get all expenses for the same month
    const expenses = await Expense.find({
      user: req.user.id,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });

    // Calculate spending by category
    const spendingByCategory = {};
    expenses.forEach(expense => {
      if (!spendingByCategory[expense.category]) {
        spendingByCategory[expense.category] = 0;
      }
      spendingByCategory[expense.category] += expense.amount;
    });

    // Create budget summary with spending and remaining
    const budgetSummary = budgets.map(budget => {
      const spent = spendingByCategory[budget.category] || 0;
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

      return {
        _id: budget._id,
        category: budget.category,
        budgetAmount: budget.amount,
        spent,
        remaining,
        percentage,
        month: budget.month,
        year: budget.year
      };
    });

    // Also include categories with expenses but no budget
    Object.keys(spendingByCategory).forEach(category => {
      const hasBudget = budgets.some(budget => budget.category === category);
      if (!hasBudget) {
        budgetSummary.push({
          category,
          budgetAmount: 0,
          spent: spendingByCategory[category],
          remaining: -spendingByCategory[category],
          percentage: 100,
          month: targetMonth,
          year: targetYear
        });
      }
    });

    res.status(200).json({
      success: true,
      month: targetMonth,
      year: targetYear,
      data: budgetSummary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 