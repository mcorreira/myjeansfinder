const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

// Protected user routes
router.get('/profile', authenticate, (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    res.json({
      success: true,
      message: 'Protected user data accessed successfully',
      data: {
        user: req.user,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Admin-only routes
router.get('/admin-data', authenticate, requireAdmin, (req, res, next) => {
  try {
    // Additional safety check
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Insufficient privileges',
      });
    }

    res.json({
      success: true,
      message: 'Admin data accessed successfully',
      data: {
        sensitiveInfo: 'Confidential admin-only data',
        auditLog: [],
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
