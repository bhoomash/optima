/**
 * Logger Utility
 * Centralized logging with different levels and formatting
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const LOG_COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[37m', // White
  RESET: '\x1b[0m'
};

class Logger {
  constructor() {
    this.level = this._parseLogLevel(process.env.LOG_LEVEL || 'INFO');
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  _parseLogLevel(level) {
    const upperLevel = level.toUpperCase();
    return LOG_LEVELS[upperLevel] !== undefined ? LOG_LEVELS[upperLevel] : LOG_LEVELS.INFO;
  }

  _formatTimestamp() {
    return new Date().toISOString();
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = this._formatTimestamp();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    
    if (this.isProduction) {
      // JSON format for production (better for log aggregation)
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta
      });
    }
    
    // Colored format for development
    const color = LOG_COLORS[level] || LOG_COLORS.RESET;
    return `${color}[${timestamp}] [${level}]${LOG_COLORS.RESET} ${message}${metaStr}`;
  }

  _log(level, message, meta) {
    if (LOG_LEVELS[level] <= this.level) {
      const formattedMessage = this._formatMessage(level, message, meta);
      
      switch (level) {
        case 'ERROR':
          console.error(formattedMessage);
          break;
        case 'WARN':
          console.warn(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }
  }

  error(message, meta = {}) {
    this._log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this._log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this._log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this._log('DEBUG', message, meta);
  }

  /**
   * Log HTTP request (for middleware)
   */
  httpRequest(req, res, duration) {
    const meta = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress
    };

    if (res.statusCode >= 500) {
      this.error('HTTP Request', meta);
    } else if (res.statusCode >= 400) {
      this.warn('HTTP Request', meta);
    } else {
      this.info('HTTP Request', meta);
    }
  }

  /**
   * Create request logging middleware
   */
  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Store original end method
      const originalEnd = res.end;
      
      res.end = (...args) => {
        const duration = Date.now() - startTime;
        this.httpRequest(req, res, duration);
        return originalEnd.apply(res, args);
      };

      next();
    };
  }
}

// Singleton instance
const logger = new Logger();

module.exports = logger;
