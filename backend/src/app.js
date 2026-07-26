const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
require('dotenv').config();

// Initialize all Sequelize model associations
require('./models');

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: true, // Allow all frontend domains (Vercel, localhost, etc.)
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'development' ? 500 : 100),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
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

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'UpsurgeERP API Documentation'
}));

// API Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/dashboard', require('./routes/dashboard'));
app.use('/api/v1/leads', require('./routes/leads'));
app.use('/api/v1/followups', require('./routes/followUps'));
app.use('/api/v1', require('./routes/leadConfig'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/students', require('./routes/students'));
app.use('/api/v1/admissions', require('./routes/admissions'));
app.use('/api/v1/fee-payments', require('./routes/feePayments'));
app.use('/api/v1/course-packages', require('./routes/coursePackages'));
app.use('/api/v1/batches', require('./routes/batches'));
app.use('/api/v1/attendance', require('./routes/attendance'));
app.use('/api/v1/qr', require('./routes/qrCodes'));
app.use('/api/v1/staff', require('./routes/staff'));
app.use('/api/v1/hrms', require('./routes/hrms'));
app.use('/api/v1/payroll', require('./routes/payroll'));
app.use('/api/v1/questions', require('./routes/questions'));
app.use('/api/v1/exams', require('./routes/exams'));
app.use('/api/v1/certificates', require('./routes/certificates'));
app.use('/api/v1/lms/videos', require('./routes/lmsVideos'));
app.use('/api/v1/lms/notes', require('./routes/studyMaterials'));
app.use('/api/v1/lms/live-classes', require('./routes/liveClasses'));
app.use('/api/v1/lms/assignments', require('./routes/assignments'));
app.use('/api/v1/portal', require('./routes/portal'));
app.use('/api/v1/student-portal', require('./routes/studentPortal'));
app.use('/api/v1/chat', require('./routes/chat'));
app.use('/api/v1/accounting', require('./routes/accounting'));
app.use('/api/v1/library', require('./routes/library'));
app.use('/api/v1/inventory', require('./routes/inventory'));
app.use('/api/v1/communication', require('./routes/communication'));
app.use('/api/v1/notices', require('./routes/notices'));
app.use('/api/v1/reports', require('./routes/reports'));
app.use('/api/v1/analytics-new', require('./routes/analyticsNew'));
app.use('/api/v1/users', require('./routes/userManagement'));
app.use('/api/v1/system', require('./routes/systemFeatures'));

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
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fields = err.errors ? err.errors.map(e => `${e.path} ('${e.value}')`).join(', ') : 'value';
    return res.status(400).json({
      status: 'error',
      message: `Duplicate entry error: The ${fields} already exists in the system. Please use a unique value.`
    });
  }
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors ? err.errors.map(e => e.message).join(', ') : err.message;
    return res.status(400).json({
      status: 'error',
      message: `Validation error: ${messages}`
    });
  }
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;
