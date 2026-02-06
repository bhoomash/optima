/**
 * Faculty Routes
 */

const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly, facultyOrAdmin } = require('../middleware/roleMiddleware');

// GET all faculty - requires authentication
router.get('/', verifyToken, facultyController.getAllFaculty);

// GET single faculty by ID - requires authentication
router.get('/:id', verifyToken, facultyController.getFacultyById);

// POST create new faculty - admin only
router.post('/', verifyToken, adminOnly, facultyController.createFaculty);

// POST bulk create faculty - admin only
router.post('/bulk', verifyToken, adminOnly, facultyController.bulkCreateFaculty);

// PUT update faculty - admin only
router.put('/:id', verifyToken, adminOnly, facultyController.updateFaculty);

// DELETE faculty - admin only
router.delete('/:id', verifyToken, adminOnly, facultyController.deleteFaculty);

module.exports = router;
