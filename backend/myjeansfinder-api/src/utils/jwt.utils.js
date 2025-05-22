const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/auth.config');

/**
 * Generate access token for user
 * @param {Object} user - User object
 * @returns {string} - Access token
 */

const generateAccessToken = (user) => {
  const payload = {
    name: user.name,
    email: user.email,
    role: user.role,
    type: 'access',
  };

  return jwt.sign(payload, config.secret, { expiresIn: config.jwt.expiresIn });
};

/**
 * Generate refresh token for user
 * @param {Object} user - User object
 * @returns {string} - Refresh token
 */

const generateRefreshToken = (user) => {
  const payload = {
    id: user.id,
    type: 'refresh',
    // Add unique token ID to allow revocation
    jwt: crypto.randomBytes(32).toString('hex'),
  };

  return jwt.sign(payload, config.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload or null if invalid
 */

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.secret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
};
