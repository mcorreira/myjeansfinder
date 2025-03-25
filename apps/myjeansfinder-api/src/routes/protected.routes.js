const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// Protected routes for authenticated users
router.get('/profile', authenticate, (req, res) => {
  res.json({
    success: true,
    message: 'You have access to this protected data',
    data: {
      userInfo: req.user,
      timestamp: new Date(),
    },
  });
});

// Protected routes for admin users
router.get('/admin-data', authenticate, requireAdmin, (req, res) => {
  res.json({
    success: true,
    message: 'You have admin access to this protected data',
    data: {
      sensitiveData: 'This is sensitive admin data',
      timestamp: new Date(),
    },
  });
});

module.exports = router;
