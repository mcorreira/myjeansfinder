module.exports = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-for-development-only',
    expiresIn: 86400, // 24 hours
    refreshExpiresIn: 604800, // 7 days
  },
};
