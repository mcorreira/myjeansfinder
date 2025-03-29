require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config');
const authRoutes = require('./routes/auth.routes');
const protectedRoutes = require('./routes/protected.routes');
const searchRoutes = require('./routes/search.routes');

const app = express();

// Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    console.log('🗄️  Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Middleware
app.use(morgan('combined')); // HTTP request logging
app.use(helmet()); // Security headers
app.use(cors(config.corsOptions)); // Configure CORS properly
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'"
  );
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/protected', protectedRoutes);
app.use('/api/v1/search', searchRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `🔍 - Not Found - ${req.originalUrl}`,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    config.isProduction && statusCode === 500
      ? 'An unexpected error occurred'
      : err.message;

  console.error('💥 ERROR:', err.stack);

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.isDevelopment && { stack: err.stack }),
  });
});

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Closing server...');
  server.close(() => {
    console.log('💤 Server closed');
    mongoose.connection.close(false);
  });
});

// Start Server
const server = app.listen(config.port, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${config.port}`);
});

module.exports = server;
