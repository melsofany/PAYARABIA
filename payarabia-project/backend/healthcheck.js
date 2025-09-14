const mongoose = require('mongoose');

const healthCheck = async () => {
  try {
    // Check database connection
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'connected' : 'disconnected';

    // Check environment variables
    const requiredEnvVars = [
      'JWT_SECRET',
      'MONGODB_URI',
      'AGORA_APP_ID',
      'AGORA_APP_CERTIFICATE',
    ];

    const missingEnvVars = requiredEnvVars.filter(
      (envVar) => !process.env[envVar]
    );

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        readyState: dbState,
      },
      environment_variables: {
        status: missingEnvVars.length === 0 ? 'ok' : 'missing',
        missing: missingEnvVars,
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
    };

    // Determine overall health
    if (dbStatus !== 'connected' || missingEnvVars.length > 0) {
      healthStatus.status = 'unhealthy';
    }

    return healthStatus;
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
};

module.exports = healthCheck;