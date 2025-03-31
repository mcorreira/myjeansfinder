const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const { authenticate } = require('../middleware/auth.middleware'); // Updated middleware name
const mongoose = require('mongoose');

// Validate MongoDB ID parameter
const validateObjectId = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format',
    });
  }
  next();
};

// Protected search routes
router.get('/search', authenticate, async (req, res, next) => {
  try {
    await searchController.searchJeans(req, res);
  } catch (error) {
    console.error('Search error:', error);
    next(error);
  }
});

router.get('/:id', authenticate, validateObjectId, async (req, res, next) => {
  try {
    await searchController.getJeansById(req, res);
  } catch (error) {
    console.error('Get item error:', error);
    next(error);
  }
});

module.exports = router;
