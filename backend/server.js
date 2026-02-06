/**
 * Smart University Resource Scheduling System
 * Main Server Entry Point
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { sanitizeInput } = require('./middleware/validationMiddleware');
const { apiRateLimiter } = require('./middleware/rateLimitMiddleware');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// CORS Configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'];
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security middleware
app.use(sanitizeInput); // Sanitize all inputs

// Request logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use(logger.requestLogger());
}

// General API rate limiting
app.use('/api', apiRateLimiter);

// Connect to MongoDB (optional - system works without it too)
connectDB();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const roomRoutes = require('./routes/roomRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const classRoutes = require('./routes/classRoutes');
const timetableRoutes = require('./routes/timetableRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api', timetableRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart University Scheduler API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // Log the error
  logger.error('Unhandled error:', { 
    error: err.message, 
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });

  // Handle specific error types
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal Server Error' : err.message,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('Smart University Resource Scheduling System started');
  
  if (!process.env.JWT_SECRET) {
    logger.warn('JWT_SECRET not set - using development fallback. Set JWT_SECRET in production!');
  }
});

module.exports = app;
