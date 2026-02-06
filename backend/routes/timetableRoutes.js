/**
 * Timetable Routes
 */

const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// POST generate timetable - admin only
router.post('/generate-timetable', verifyToken, adminOnly, timetableController.generateTimetable);

// GET active timetable - PUBLIC (no login required for students)
router.get('/timetable', timetableController.getTimetable);

// GET all timetables - PUBLIC
router.get('/timetables', timetableController.getAllTimetables);

// GET timetable by ID - PUBLIC
router.get('/timetable/:id', timetableController.getTimetableById);

// GET class timetable as grid - PUBLIC (students can view their class schedule)
router.get('/timetable/class/:classId/grid', timetableController.getClassTimetableGrid);

// GET faculty timetable - PUBLIC (faculty can view their schedule)
router.get('/timetable/faculty/:facultyId', timetableController.getFacultyTimetable);

// DELETE timetable - admin only
router.delete('/timetable/:id', verifyToken, adminOnly, timetableController.deleteTimetable);

module.exports = router;
