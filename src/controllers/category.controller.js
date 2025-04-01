const Category = require('../models/category.model');

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    
    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get a single category
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        category
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    // Validate input
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Category name is required'
      });
    }
    
    // Create category
    const newCategory = await Category.create(name, description);
    
    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: {
        category: newCategory
      }
    });
  } catch (error) {
    // Check for duplicate name error
    if (error.message.includes('Duplicate entry')) {
      return res.status(409).json({
        status: 'error',
        message: 'A category with this name already exists'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 