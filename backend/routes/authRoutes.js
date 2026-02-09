/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { loginRateLimiter, registrationRateLimiter } = require('../middleware/rateLimitMiddleware');
const { registerValidation, loginValidation, updatePasswordValidation } = require('../middleware/validationMiddleware');
const inMemoryStore = require('../utils/inMemoryStore');
const logger = require('../utils/logger');
const auditLogger = require('../utils/auditLogger');

// Counter for in-memory user IDs
let userIdCounter = 1;

// JWT Secrets - MUST be set in production
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Shorter expiry for access token
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Validate JWT_SECRET is set
if (!JWT_SECRET) {
  logger.error('JWT_SECRET is not set! Authentication will not work securely.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Use a fallback secret only in development
const getJwtSecret = () => JWT_SECRET || 'dev-secret-change-in-production';
const getRefreshSecret = () => JWT_REFRESH_SECRET || getJwtSecret();

/**
 * Generate Access Token (short-lived)
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id || user.id,
      email: user.email,
      role: user.role,
      type: 'access'
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Generate Refresh Token (long-lived)
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id || user.id,
      type: 'refresh'
    },
    getRefreshSecret(),
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registrationRateLimiter, registerValidation, async (req, res) => {
  try {
    const { name, email, password, role, facultyId, classId } = req.body;

    // Validate role
    const validRoles = ['admin', 'faculty', 'student'];
    const userRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : 'student';

    // Try MongoDB first
    let user;
    let usingInMemory = false;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create new user
      user = new User({
        name,
        email: email.toLowerCase(),
        password,
        role: userRole,
        facultyId: facultyId || null,
        classId: classId || null
      });

      await user.save();
    } catch (dbError) {
      // Fallback to in-memory storage
      console.log('MongoDB not available, using in-memory storage');
      usingInMemory = true;

      // Check if user exists in memory
      const existingUser = inMemoryStore.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password manually for in-memory
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUserId = `user_${userIdCounter++}`;
      user = {
        id: newUserId,
        _id: newUserId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: userRole,
        facultyId: facultyId || null,
        classId: classId || null,
        isActive: true,
        createdAt: new Date()
      };

      inMemoryStore.activate();
      inMemoryStore.addUser(user);
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        refreshToken,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          facultyId: user.facultyId,
          classId: user.classId
        }
      }
    });

  } catch (error) {
    logger.error('Registration error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', loginRateLimiter, loginValidation, async (req, res) => {
  try {
    const { email, password } = req.body;

    let user;
    let isPasswordValid = false;

    // Try MongoDB first
    try {
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      
      if (user) {
        isPasswordValid = await user.comparePassword(password);
      }
    } catch (dbError) {
      // Fallback to in-memory storage
      logger.info('MongoDB not available, using in-memory storage');
      inMemoryStore.activate();
      user = inMemoryStore.getUserByEmail(email);
      
      if (user) {
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
    }

    // Check if user exists
    if (!user) {
      auditLogger.logLogin(email, false, { ip: req.ip, reason: 'User not found' });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    if (!isPasswordValid) {
      auditLogger.logLogin(user._id || user.id, false, { ip: req.ip, reason: 'Invalid password' });
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (user.isActive === false) {
      auditLogger.logLogin(user._id || user.id, false, { ip: req.ip, reason: 'Account deactivated' });
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Update last login
    try {
      if (user.save) {
        user.lastLogin = new Date();
        await user.save();
      } else {
        user.lastLogin = new Date();
      }
    } catch (e) {
      // Ignore update errors
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log successful login
    auditLogger.logLogin(user._id || user.id, true, { ip: req.ip, email: user.email });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        refreshToken,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          facultyId: user.facultyId,
          classId: user.classId
        }
      }
    });

  } catch (error) {
    logger.error('Login error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/auth/faculty-login
 * @desc    Login faculty member using facultyId and name
 * @access  Public
 */
router.post('/faculty-login', async (req, res) => {
  try {
    const { facultyId, name } = req.body;

    // Validation
    if (!facultyId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide faculty ID and name'
      });
    }

    // Import Faculty model
    const Faculty = require('../models/Faculty');

    let faculty;

    try {
      // Find faculty by ID and name (case-insensitive name match)
      // Escape special regex characters to prevent ReDoS attacks
      const escapedName = name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      faculty = await Faculty.findOne({
        id: facultyId,
        name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
      });
    } catch (dbError) {
      console.error('Database error during faculty login:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error. Please try again.'
      });
    }

    // Check if faculty exists
    if (!faculty) {
      return res.status(401).json({
        success: false,
        message: 'Invalid faculty ID or name'
      });
    }

    // Generate token for faculty
    const token = jwt.sign(
      {
        facultyId: faculty.id,
        name: faculty.name,
        role: 'faculty-member',
        isFacultyLogin: true
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: 'Faculty login successful',
      data: {
        token,
        faculty: {
          id: faculty.id,
          name: faculty.name,
          department: faculty.department,
          subjectsCanTeach: faculty.subjectsCanTeach
        }
      }
    });

  } catch (error) {
    console.error('Faculty login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    let user;

    try {
      user = await User.findById(req.user.userId).select('-password');
    } catch (dbError) {
      user = inMemoryStore.getUserById(req.user.userId);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        facultyId: user.facultyId,
        classId: user.classId,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
});

/**
 * @route   PUT /api/auth/update-password
 * @desc    Update user password
 * @access  Private
 */
router.put('/update-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    let user;
    let isPasswordValid = false;

    try {
      user = await User.findById(req.user.userId).select('+password');
      if (user) {
        isPasswordValid = await user.comparePassword(currentPassword);
      }
    } catch (dbError) {
      user = inMemoryStore.getUserById(req.user.userId);
      if (user) {
        isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    if (user.save) {
      user.password = newPassword;
      await user.save();
    } else {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating password'
    });
  }
});

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private/Admin
 */
router.get('/users', verifyToken, adminOnly, async (req, res) => {
  try {
    let users;

    try {
      users = await User.find().select('-password').sort({ createdAt: -1 });
    } catch (dbError) {
      users = inMemoryStore.getUsers().map(u => ({
        id: u._id || u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        facultyId: u.facultyId,
        classId: u.classId,
        isActive: u.isActive,
        createdAt: u.createdAt
      }));
    }

    res.json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

/**
 * @route   PUT /api/auth/users/:id/role
 * @desc    Update user role (Admin only)
 * @access  Private/Admin
 */
router.put('/users/:id/role', verifyToken, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.id;

    const validRoles = ['admin', 'faculty', 'student'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be: admin, faculty, or student'
      });
    }

    let user;

    try {
      user = await User.findByIdAndUpdate(
        userId,
        { role: role.toLowerCase() },
        { new: true }
      ).select('-password');
    } catch (dbError) {
      user = inMemoryStore.getUserById(userId);
      if (user) {
        user.role = role.toLowerCase();
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user role'
    });
  }
});

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Deactivate/Delete user (Admin only)
 * @access  Private/Admin
 */
router.delete('/users/:id', verifyToken, adminOnly, async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent self-deletion
    if (req.user.userId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    let user;

    try {
      user = await User.findByIdAndUpdate(
        userId,
        { isActive: false },
        { new: true }
      );
    } catch (dbError) {
      const updated = inMemoryStore.updateUser(userId, { isActive: false });
      if (updated) {
        user = updated;
      }
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user'
    });
  }
});

/**
 * @route   POST /api/auth/verify-token
 * @desc    Verify if token is valid
 * @access  Public
 */
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    res.json({
      success: true,
      valid: true,
      data: {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp
      }
    });

  } catch (error) {
    res.json({
      success: false,
      valid: false,
      message: error.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token'
    });
  }
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, getRefreshSecret());
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token has expired. Please login again.'
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Check token type
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    // Find user
    let user;
    try {
      user = await User.findById(decoded.userId);
    } catch (dbError) {
      user = inMemoryStore.getUserById(decoded.userId);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated'
      });
    }

    // Generate new tokens
    const newAccessToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    logger.error('Token refresh error:', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
});

module.exports = router;
