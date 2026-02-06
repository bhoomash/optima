/**
 * Room Routes
 */

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { verifyToken } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// GET all rooms - requires authentication
router.get('/', verifyToken, roomController.getAllRooms);

// GET single room by ID - requires authentication
router.get('/:id', verifyToken, roomController.getRoomById);

// POST create new room - admin only
router.post('/', verifyToken, adminOnly, roomController.createRoom);

// POST bulk create rooms - admin only
router.post('/bulk', verifyToken, adminOnly, roomController.bulkCreateRooms);

// PUT update room - admin only
router.put('/:id', verifyToken, adminOnly, roomController.updateRoom);

// DELETE room - admin only
router.delete('/:id', verifyToken, adminOnly, roomController.deleteRoom);

module.exports = router;
