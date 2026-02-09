/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const inMemoryStore = require('../utils/inMemoryStore');
const logger = require('../utils/logger');

// Get JWT secret with validation
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    // Generate a random secret for development (changes on restart)
    console.warn('⚠️  No JWT_SECRET set - using temporary random secret (will invalidate tokens on restart)');
    return require('crypto').randomBytes(64).toString('hex');
  }
  return secret;
};

// Cache the secret to avoid regenerating
let cachedJwtSecret = null;
const getCachedJwtSecret = () => {
  if (!cachedJwtSecret) {
    cachedJwtSecret = getJwtSecret();
  }
  return cachedJwtSecret;
};

/**
 * Verify JWT Token Middleware
 * Checks if the request has a valid JWT token
 */
const verifyToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, getCachedJwtSecret());

    // Check token type (reject refresh tokens used as access tokens)
    if (decoded.type === 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Use access token.'
      });
    }

    // Try to find user in database first
    let user = null;
    
    try {
      user = await User.findById(decoded.userId).select('-password');
    } catch (dbError) {
      // Database not available, try in-memory store
      user = inMemoryStore.getUserById(decoded.userId);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user not found.'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated.'
      });
    }

    // Attach user to request
    req.user = {
      userId: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      facultyId: user.facultyId,
      classId: user.classId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    logger.error('Auth middleware error:', { error: error.message });
    return res.status(500).json({
      success: false,
      message: 'Error authenticating user.'
    });
  }
};

/**
 * Optional Auth Middleware
 * Attaches user if token is present, but doesn't block if not
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = jwt.verify(token, getCachedJwtSecret());
    
    // Reject refresh tokens
    if (decoded.type === 'refresh') {
      return next();
    }
    
    let user = null;
    try {
      user = await User.findById(decoded.userId).select('-password');
    } catch (dbError) {
      user = inMemoryStore.getUserById(decoded.userId);
    }

    if (user && user.isActive !== false) {
      req.user = {
        userId: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        facultyId: user.facultyId,
        classId: user.classId
      };
    }

    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

module.exports = {
  verifyToken,
  optionalAuth
};