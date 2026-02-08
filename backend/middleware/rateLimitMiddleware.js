/**
 * Rate Limiting Middleware
 * Protects authentication endpoints against brute-force attacks
 */

// In-memory store for rate limiting (consider Redis for production)
const rateLimitStore = new Map();

/**
 * Clean up expired entries periodically
 */
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now > data.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute

// Prevent memory leak on server shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => clearInterval(cleanupInterval));
  process.on('SIGINT', () => clearInterval(cleanupInterval));
}

/**
 * Create rate limiter middleware
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 minutes)
 * @param {number} options.max - Maximum requests per window (default: 100)
 * @param {string} options.message - Error message when limit exceeded
 * @param {boolean} options.skipSuccessfulRequests - Don't count successful requests
 * @param {boolean} options.skipFailedRequests - Don't count failed requests
 */
const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = (req) => req.ip || req.connection.remoteAddress || 'unknown'
  } = options;

  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Get or initialize rate limit data
    let limitData = rateLimitStore.get(key);
    
    if (!limitData || now > limitData.resetTime) {
      limitData = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Increment count
    limitData.count++;
    rateLimitStore.set(key, limitData);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - limitData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil(limitData.resetTime / 1000));

    // Check if limit exceeded
    if (limitData.count > max) {
      const retryAfter = Math.ceil((limitData.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfter);
      
      return res.status(429).json({
        success: false,
        message,
        retryAfter
      });
    }

    // Handle skip options
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalEnd = res.end;
      res.end = function(...args) {
        if (skipSuccessfulRequests && res.statusCode < 400) {
          limitData.count--;
          rateLimitStore.set(key, limitData);
        }
        if (skipFailedRequests && res.statusCode >= 400) {
          limitData.count--;
          rateLimitStore.set(key, limitData);
        }
        return originalEnd.apply(res, args);
      };
    }

    next();
  };
};

/**
 * Strict rate limiter for login attempts
 * 20 attempts per 15 minutes per IP
 */
const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  skipSuccessfulRequests: true // Don't count successful logins
});

/**
 * Strict rate limiter for password reset
 * 3 attempts per hour per IP
 */
const passwordResetRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset attempts. Please try again after 1 hour.'
});

/**
 * Rate limiter for registration
 * 10 attempts per hour per IP
 */
const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: 'Too many registration attempts. Please try again after 1 hour.'
});

/**
 * General API rate limiter
 * 100 requests per 15 minutes
 */
const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please slow down.'
});

/**
 * Reset rate limit for a specific key (useful for testing or admin override)
 */
const resetRateLimit = (key) => {
  rateLimitStore.delete(key);
};

module.exports = {
  createRateLimiter,
  loginRateLimiter,
  passwordResetRateLimiter,
  registrationRateLimiter,
  apiRateLimiter,
  resetRateLimit
};
