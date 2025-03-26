const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Load secret from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No token provided',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    if (decoded.type && decoded.type !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type',
      });
    }

    // Fixed variable name collision
    const user = await User.findById(decoded.id || decoded.sub)
      .select('-password -salt')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user; // Fixed reference
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({
    success: false,
    message: 'Access denied. Admin required.',
  });
};

module.exports = {
  verifyToken: authenticate,
  requireAdmin,
};

console.log('Middleware exports:', { verifyToken, requireAdmin });
