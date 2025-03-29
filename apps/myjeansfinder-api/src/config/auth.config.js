const dotenv = require('dotenv');

// Load environment variables from a `.env` file (if present)
dotenv.config();

module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development-only',
    expiresIn: '24h', // Use human-readable format for better clarity
    refreshExpiresIn: '7d', // Use human-readable format for better clarity
  },
};
