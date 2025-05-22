const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/auth.config'); // Use centralized config instead of hardcoding

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    console.error('Token verification error:', error); // Log for debugging
    return null;
  }
};

/**
 * Authenticate requests using JWT from Authorization header
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
      });
    }

    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type.',
      });
    }

    // Find user by ID from the decoded token
    const user = await User.findById(decoded.id || decoded.sub)
      .select('-password -salt')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    req.user = user; // Attach user to the request object
    next();
  } catch (error) {
    console.error('Authentication error:', error); // Log for debugging
    res.status(500).json({
      success: false,
      message: 'Server error.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Middleware to check if authenticated user is an admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') {
    return next();
  }

  res.status(403).json({
    success: false,
    message: 'Access denied. Admin privileges required.',
  });
};

module.exports = {
  verifyToken,
  authenticate,
  requireAdmin,
};
