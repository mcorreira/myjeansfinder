module.exports = {
  port: process.env.PORT || 3000,
  mongoURI:
    process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/myjeansfinder',
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  corsOptions: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
};
