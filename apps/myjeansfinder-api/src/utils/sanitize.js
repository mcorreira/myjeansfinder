const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/auth.config');

// Token types for better validation
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
};

// Token generation configuration
const TOKEN_CONFIG = {
  [TOKEN_TYPES.ACCESS]: {
    expiresIn: config.jwt.expiresIn,
    payloadFields: ['sub', 'role'], // Only include necessary claims
  },
  [TOKEN_TYPES.REFERSH]: {
    expiresIn: config.jwt.refreshExpiresIn,
    payloadFields: ['sub', 'jti'],
  },
};

/**
 * Generate cryptographically secure token ID
 * @returns {string} - Unique token identifier
 */
const generateTokenId = () => crypto.randomBytes(16).toString('hex');

/**
 * Generate JWT token with standardized claims
 * @param {Object} user - User object
 * @param {string} type - Token type (access/refresh)
 * @returns {string} - Generated JWT token
 */
const generateToken = (user, type = TOKEN_TYPES.ACCESS) => {
  if (!user?.id) throw new Error('Invalid user object');
  if (!TOKEN_CONFIG[type]) throw new Error('Invalid token type');

  const payload = {
    sub: user.id, // Subject (user ID)
    iss: 'myjeansfinder-api', // Issuer
    iat: Math.floor(Date.now() / 1000), // Issued at
    ...(type === TOKEN_TYPES.ACCESS && { role: user.role }),
    ...(type === TOKEN_TYPES.REFRESH && { jti: generateTokenId() }),
    type,
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: TOKEN_CONFIG[type].expiresIn,
    algorithm: 'HS256',
  });
};

/**
 * Verify JWT token with proper error handling
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If verification fails
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret, {
      algorithms: ['HS256'],
      ignoreExpiration: false,
    });
  } catch (error) {
    console.error('Token verification failed:', error.message);
    throw new Error('Invalid or expired token');
  }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User object
 * @returns {Object} - Token pair
 */
const generateTokenPair = (user) => ({
  accessToken: generateToken(user, TOKEN_TYPES.ACCESS),
  refreshToken: generateToken(user, TOKEN_TYPES.REFRESH),
});

module.exports = {
  generateToken,
  generateTokenPair,
  verifyToken,
  TOKEN_TYPES,
};
