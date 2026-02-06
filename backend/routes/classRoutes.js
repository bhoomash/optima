/**
 * Class Routes
 */

const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// GET all classes - PUBLIC (students need to see class list)
router.get('/', classController.getAllClasses);

// GET single class by ID - PUBLIC
router.get('/:id', classController.getClassById);

// POST create new class - admin only
router.post('/', verifyToken, adminOnly, classController.createClass);

// POST bulk create classes - admin only
router.post('/bulk', verifyToken, adminOnly, classController.bulkCreateClasses);

// PUT update class - admin only
router.put('/:id', verifyToken, adminOnly, classController.updateClass);

// DELETE class - admin only
router.delete('/:id', verifyToken, adminOnly, classController.deleteClass);

module.exports = router;
