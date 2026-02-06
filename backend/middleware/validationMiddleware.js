/**
 * Validation Middleware
 * Input validation and sanitization for security
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors - middleware to check validation results
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Password strength validator
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
const passwordStrengthValidator = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters long')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)');

/**
 * Email validator with sanitization
 */
const emailValidator = body('email')
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage('Please provide a valid email address')
  .normalizeEmail();

/**
 * Name validator with sanitization
 */
const nameValidator = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters')
  .matches(/^[a-zA-Z\s'-]+$/)
  .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes')
  .escape(); // Escape HTML entities

/**
 * Sanitize MongoDB query object to prevent NoSQL injection
 */
const sanitizeMongoQuery = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      // Block MongoDB operators in user input
      if (key.startsWith('$')) {
        continue; // Skip MongoDB operators
      }
      
      const value = obj[key];
      
      if (typeof value === 'string') {
        // Remove potential injection patterns
        sanitized[key] = value.replace(/[${}]/g, '');
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeMongoQuery(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Middleware to sanitize request body, params, and query
 */
const sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeMongoQuery(req.body);
  }
  if (req.params) {
    req.params = sanitizeMongoQuery(req.params);
  }
  if (req.query) {
    req.query = sanitizeMongoQuery(req.query);
  }
  next();
};

/**
 * Registration validation rules
 */
const registerValidation = [
  nameValidator,
  emailValidator,
  passwordStrengthValidator,
  body('role')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(['admin', 'faculty', 'student'])
    .withMessage('Role must be one of: admin, faculty, student'),
  body('facultyId')
    .optional()
    .trim()
    .escape(),
  body('classId')
    .optional()
    .trim()
    .escape(),
  handleValidationErrors
];

/**
 * Login validation rules
 */
const loginValidation = [
  body('email')
    .trim()
    .toLowerCase()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

/**
 * Update password validation rules
 */
const updatePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  passwordStrengthValidator,
  handleValidationErrors
];

/**
 * Faculty validation rules
 */
const facultyValidation = [
  body('id')
    .trim()
    .notEmpty()
    .withMessage('Faculty ID is required')
    .escape(),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .escape(),
  body('department')
    .trim()
    .notEmpty()
    .withMessage('Department is required')
    .escape(),
  body('subjectsCanTeach')
    .isArray({ min: 1 })
    .withMessage('At least one subject must be provided'),
  body('maxHoursPerDay')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('Max hours per day must be between 1 and 12'),
  handleValidationErrors
];

/**
 * Room validation rules
 */
const roomValidation = [
  body('id')
    .trim()
    .notEmpty()
    .withMessage('Room ID is required')
    .escape(),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Room name is required')
    .escape(),
  body('capacity')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Capacity must be between 1 and 1000'),
  body('type')
    .optional()
    .trim()
    .isIn(['classroom', 'lab', 'auditorium', 'seminar'])
    .withMessage('Type must be one of: classroom, lab, auditorium, seminar'),
  handleValidationErrors
];

/**
 * Subject validation rules
 */
const subjectValidation = [
  body('id')
    .trim()
    .notEmpty()
    .withMessage('Subject ID is required')
    .escape(),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required')
    .escape(),
  body('code')
    .trim()
    .notEmpty()
    .withMessage('Subject code is required')
    .escape(),
  body('hoursPerWeek')
    .isInt({ min: 1, max: 40 })
    .withMessage('Hours per week must be between 1 and 40'),
  body('isLab')
    .optional()
    .isBoolean()
    .withMessage('isLab must be a boolean'),
  handleValidationErrors
];

/**
 * Class validation rules
 */
const classValidation = [
  body('id')
    .trim()
    .notEmpty()
    .withMessage('Class ID is required')
    .escape(),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Class name is required')
    .escape(),
  body('semester')
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be between 1 and 12'),
  body('strength')
    .isInt({ min: 1, max: 1000 })
    .withMessage('Strength must be between 1 and 1000'),
  handleValidationErrors
];

/**
 * ID parameter validation
 */
const idParamValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('ID parameter is required')
    .escape(),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  sanitizeInput,
  sanitizeMongoQuery,
  passwordStrengthValidator,
  emailValidator,
  nameValidator,
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  facultyValidation,
  roomValidation,
  subjectValidation,
  classValidation,
  idParamValidation
};
