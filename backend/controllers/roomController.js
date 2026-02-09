/**
 * Room Controller
 * Handles CRUD operations for rooms
 */

const Room = require('../models/Room');

// In-memory storage (fallback when MongoDB is not available)
let inMemoryRooms = [];

/**
 * Get all rooms
 * Supports pagination with ?page=1&limit=20
 * Supports filtering with ?type=lab&building=A&isActive=true
 */
exports.getAllRooms = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;
    
    // Build filter - only add isActive filter if explicitly requested
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.type) {
      filter.type = req.query.type;
    }
    if (req.query.building) {
      filter.building = req.query.building;
    }
    
    let rooms, total;
    
    try {
      total = await Room.countDocuments(filter);
      rooms = await Room.find(filter)
        .sort({ roomId: 1 })
        .skip(skip)
        .limit(limit);
    } catch (dbError) {
      let filtered = inMemoryRooms;
      if (filter.isActive !== undefined) {
        filtered = filtered.filter(r => r.isActive === filter.isActive);
      }
      if (filter.type) {
        filtered = filtered.filter(r => r.type === filter.type);
      }
      if (filter.building) {
        filtered = filtered.filter(r => r.building === filter.building);
      }
      total = filtered.length;
      rooms = filtered.slice(skip, skip + limit);
    }
    
    res.json({
      success: true,
      count: rooms.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: rooms
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching rooms',
      error: error.message
    });
  }
};

/**
 * Get single room by ID
 */
exports.getRoomById = async (req, res) => {
  try {
    let room;
    
    try {
      room = await Room.findOne({ roomId: req.params.id });
    } catch (dbError) {
      room = inMemoryRooms.find(r => r.roomId === req.params.id);
    }
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching room',
      error: error.message
    });
  }
};

/**
 * Create new room
 */
exports.createRoom = async (req, res) => {
  try {
    const { roomId, name, type, capacity, building, floor, facilities } = req.body;
    
    // Validation
    if (!roomId || !name || !type || !capacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomId, name, type, and capacity'
      });
    }
    
    if (!['classroom', 'lab'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Room type must be either "classroom" or "lab"'
      });
    }
    
    const roomData = {
      roomId,
      name,
      type,
      capacity,
      building,
      floor,
      facilities: facilities || []
    };
    
    let room;
    
    try {
      room = await Room.create(roomData);
    } catch (dbError) {
      // Check for duplicate in memory
      if (inMemoryRooms.find(r => r.roomId === roomId)) {
        return res.status(400).json({
          success: false,
          message: 'Room with this ID already exists'
        });
      }
      roomData.createdAt = new Date();
      inMemoryRooms.push(roomData);
      room = roomData;
    }
    
    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: room
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Room with this ID already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating room',
      error: error.message
    });
  }
};

/**
 * Update room
 */
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    let room;
    
    try {
      room = await Room.findOneAndUpdate(
        { roomId: id },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (dbError) {
      const index = inMemoryRooms.findIndex(r => r.roomId === id);
      if (index !== -1) {
        inMemoryRooms[index] = { ...inMemoryRooms[index], ...updateData };
        room = inMemoryRooms[index];
      }
    }
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room updated successfully',
      data: room
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating room',
      error: error.message
    });
  }
};

/**
 * Delete room
 */
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    let room;
    
    try {
      room = await Room.findOneAndDelete({ roomId: id });
    } catch (dbError) {
      const index = inMemoryRooms.findIndex(r => r.roomId === id);
      if (index !== -1) {
        room = inMemoryRooms.splice(index, 1)[0];
      }
    }
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting room',
      error: error.message
    });
  }
};

/**
 * Bulk create rooms
 */
exports.bulkCreateRooms = async (req, res) => {
  try {
    const { rooms: roomsList } = req.body;
    
    if (!Array.isArray(roomsList) || roomsList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of rooms'
      });
    }
    
    let created;
    
    try {
      created = await Room.insertMany(roomsList, { ordered: false });
    } catch (dbError) {
      // Fallback to in-memory
      created = [];
      for (const r of roomsList) {
        if (!inMemoryRooms.find(existing => existing.roomId === r.roomId)) {
          r.createdAt = new Date();
          inMemoryRooms.push(r);
          created.push(r);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: `${created.length} rooms created`,
      data: created
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating rooms',
      error: error.message
    });
  }
};

// Export in-memory storage for use in scheduler
exports.getInMemoryRooms = () => inMemoryRooms;
exports.setInMemoryRooms = (data) => { inMemoryRooms = data; };
