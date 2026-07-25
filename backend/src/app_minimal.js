const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static Files
app.use('/uploads', express.static('uploads'));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'UpsurgeERP API is running',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes (only this one for now)
app.use('/api/v1/auth', require('./routes/auth.routes'));

// Core Routes
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/leads', require('./routes/leads'));
app.use('/api/v1/students', require('./routes/students'));
app.use('/api/v1/batches', require('./routes/batches'));
app.use('/api/v1/attendance', require('./routes/attendance'));
app.use('/api/v1/fee-payments', require('./routes/feePayments'));
app.use('/api/v1/staff', require('./routes/staff'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/followups', require('./routes/followUps'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1', require('./routes/leadConfig'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
