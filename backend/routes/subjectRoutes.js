/**
 * Subject Routes
 */

const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// GET all subjects - requires authentication
router.get('/', verifyToken, subjectController.getAllSubjects);

// GET single subject by ID - requires authentication
router.get('/:id', verifyToken, subjectController.getSubjectById);

// POST create new subject - admin only
router.post('/', verifyToken, adminOnly, subjectController.createSubject);

// POST bulk create subjects - admin only
router.post('/bulk', verifyToken, adminOnly, subjectController.bulkCreateSubjects);

// PUT update subject - admin only
router.put('/:id', verifyToken, adminOnly, subjectController.updateSubject);

// DELETE subject - admin only
router.delete('/:id', verifyToken, adminOnly, subjectController.deleteSubject);

module.exports = router;
