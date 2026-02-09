/**
 * Audit Logger
 * Logs critical operations for security and compliance tracking
 */

const logger = require('./logger');

class AuditLogger {
  constructor() {
    this.auditLog = [];
    this.maxLogSize = 10000; // Keep last 10000 events in memory
  }

  /**
   * Log an audit event
   * @param {string} action - The action performed (e.g., 'LOGIN', 'CREATE', 'UPDATE', 'DELETE')
   * @param {string} resource - The resource type (e.g., 'USER', 'TIMETABLE', 'FACULTY')
   * @param {string} userId - The ID of the user performing the action
   * @param {object} details - Additional details about the action
   * @param {string} status - 'SUCCESS' or 'FAILURE'
   */
  log(action, resource, userId, details = {}, status = 'SUCCESS') {
    const event = {
      timestamp: new Date().toISOString(),
      action,
      resource,
      userId: userId || 'ANONYMOUS',
      status,
      details,
      ip: details.ip || null
    };

    // Log to console/file
    const logMessage = `[AUDIT] ${event.timestamp} | ${status} | ${action} | ${resource} | User: ${event.userId} | ${JSON.stringify(details)}`;
    
    if (status === 'FAILURE') {
      logger.warn(logMessage);
    } else {
      logger.info(logMessage);
    }

    // Store in memory (for potential retrieval)
    this.auditLog.push(event);
    
    // Trim log if too large
    if (this.auditLog.length > this.maxLogSize) {
      this.auditLog = this.auditLog.slice(-this.maxLogSize);
    }

    return event;
  }

  // Convenience methods for common actions
  
  logLogin(userId, success, details = {}) {
    return this.log('LOGIN', 'AUTH', userId, details, success ? 'SUCCESS' : 'FAILURE');
  }

  logLogout(userId, details = {}) {
    return this.log('LOGOUT', 'AUTH', userId, details, 'SUCCESS');
  }

  logCreate(resource, userId, details = {}) {
    return this.log('CREATE', resource, userId, details, 'SUCCESS');
  }

  logUpdate(resource, userId, details = {}) {
    return this.log('UPDATE', resource, userId, details, 'SUCCESS');
  }

  logDelete(resource, userId, details = {}) {
    return this.log('DELETE', resource, userId, details, 'SUCCESS');
  }

  logAccess(resource, userId, details = {}) {
    return this.log('ACCESS', resource, userId, details, 'SUCCESS');
  }

  logAccessDenied(resource, userId, details = {}) {
    return this.log('ACCESS_DENIED', resource, userId, details, 'FAILURE');
  }

  logSecurityEvent(eventType, userId, details = {}) {
    return this.log(eventType, 'SECURITY', userId, details, 'FAILURE');
  }

  /**
   * Get recent audit logs (for admin review)
   * @param {number} limit - Number of events to return
   * @param {object} filters - Optional filters { action, resource, userId, status }
   */
  getRecentLogs(limit = 100, filters = {}) {
    let logs = [...this.auditLog];
    
    if (filters.action) {
      logs = logs.filter(l => l.action === filters.action);
    }
    if (filters.resource) {
      logs = logs.filter(l => l.resource === filters.resource);
    }
    if (filters.userId) {
      logs = logs.filter(l => l.userId === filters.userId);
    }
    if (filters.status) {
      logs = logs.filter(l => l.status === filters.status);
    }

    return logs.slice(-limit).reverse(); // Most recent first
  }

  /**
   * Clear audit log (for testing)
   */
  clear() {
    this.auditLog = [];
  }
}

// Singleton instance
const auditLogger = new AuditLogger();

module.exports = auditLogger;
