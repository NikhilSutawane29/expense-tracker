const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Category routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);

// Protected routes (admin only)
router.post('/', verifyToken, categoryController.createCategory);

module.exports = router; 