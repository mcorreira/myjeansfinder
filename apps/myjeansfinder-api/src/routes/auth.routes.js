const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
//router.post('/logout', logout);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);

module.exports = router;
