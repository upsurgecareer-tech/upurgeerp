const app = require('./app');
const { testConnection } = require('./config/database');
const { initializeCronJobs } = require('./utils/cronService');
const { initRedis } = require('./utils/cacheService');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Start server immediately so health checks pass on Render without timing out
const startServer = () => {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/v1`);
    console.log(`🌐 Network: http://192.168.1.7:${PORT}/api/v1`);
    console.log(`💚 Health: http://localhost:${PORT}/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Retrying in 3 seconds...`);
      setTimeout(() => startServer(), 3000);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });

  // Initialize DB, Redis, and Cron Jobs asynchronously (non-blocking)
  testConnection().catch(err => console.error('DB connect error:', err.message));
  initRedis().catch(err => console.error('Redis connect error:', err.message));
  try {
    initializeCronJobs();
  } catch (err) {
    console.error('Cron job init error:', err.message);
  }
};

startServer();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
