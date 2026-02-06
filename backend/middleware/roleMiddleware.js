/**
 * Role-Based Access Control (RBAC) Middleware
 * Authorizes users based on their roles
 */

/**
 * Authorize specific roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Check if user exists on request (should be attached by verifyToken)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first.'
      });
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This action requires one of the following roles: ${allowedRoles.join(', ')}. Your role: ${req.user.role}`
      });
    }

    next();
  };
};

/**
 * Admin only access
 */
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }

  next();
};

/**
 * Faculty and Admin access
 */
const facultyOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (!['admin', 'faculty'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Faculty or Admin privileges required.'
    });
  }

  next();
};

/**
 * Check if user is accessing their own resource
 * Used for faculty viewing their own schedule
 */
const isOwnResource = (resourceIdParam = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Admins can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    const resourceId = req.params[resourceIdParam];

    // For faculty, check if they're accessing their own data
    if (req.user.role === 'faculty' && req.user.facultyId === resourceId) {
      return next();
    }

    // For students, check if they're accessing their own class data
    if (req.user.role === 'student' && req.user.classId === resourceId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own resources.'
    });
  };
};

/**
 * Role hierarchy check
 * Admin > Faculty > Student
 */
const roleHierarchy = {
  admin: 3,
  faculty: 2,
  student: 1
};

/**
 * Check if user has minimum role level
 * @param {string} minimumRole - Minimum role required
 */
const hasMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Minimum role required: ${minimumRole}`
      });
    }

    next();
  };
};

module.exports = {
  authorizeRoles,
  adminOnly,
  facultyOrAdmin,
  isOwnResource,
  hasMinimumRole,
  roleHierarchy
};
