const express = require('express');
const {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary
} = require('../controllers/budgetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Budget routes
router.route('/')
  .get(getBudgets)
  .post(createBudget);

router.route('/summary')
  .get(getBudgetSummary);

router.route('/:id')
  .put(updateBudget)
  .delete(deleteBudget);

module.exports = router; 