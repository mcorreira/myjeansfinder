const jwt = require('jsonwebtoken');
const user = require('../models/user');

// Load secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded token payload or null if invalid
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Authenticate requests using JWT from Authorization header
 */

const authenticate = async (req, res, next) => {
  try {
    // Check if authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided',
      });
    }

    // Extract token from header
    const token = authHeader.split(' ')[1];

    // verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    //verify it's an access token
    if (decoded.type && decoded.type !== 'access') {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid token type' });
    }

    // find user by id in database
    const user = await User.findById(decoded.id || decoded.sub).select(
      '-password -salt'
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'User not found' });
    }
    // Attach user to request object
    req.user = user;

    next();
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * Middleware to check if authenticated user is admin
 */

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res
      .status(403)
      .json({ success: false, message: 'Access denied. Admin required.' });
  }
};
module.exports = { authenticate, requireAdmin };
