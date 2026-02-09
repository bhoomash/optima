/**
 * Faculty Controller
 * Handles CRUD operations for faculty members
 */

const Faculty = require('../models/Faculty');

// In-memory storage (fallback when MongoDB is not available)
let inMemoryFaculty = [];

/**
 * Get all faculty members
 * Supports pagination with ?page=1&limit=20
 * Supports filtering with ?department=CSE&isActive=true
 */
exports.getAllFaculty = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;
    
    // Build filter - only add isActive filter if explicitly requested
    const filter = {};
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }
    if (req.query.department) {
      filter.department = req.query.department;
    }
    
    let faculty, total;
    
    try {
      total = await Faculty.countDocuments(filter);
      faculty = await Faculty.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
    } catch (dbError) {
      // Fallback to in-memory
      let filtered = inMemoryFaculty;
      if (filter.isActive !== undefined) {
        filtered = filtered.filter(f => f.isActive === filter.isActive);
      }
      if (filter.department) {
        filtered = filtered.filter(f => f.department === filter.department);
      }
      total = filtered.length;
      faculty = filtered.slice(skip, skip + limit);
    }
    
    res.json({
      success: true,
      count: faculty.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message
    });
  }
};

/**
 * Get single faculty member by ID
 */
exports.getFacultyById = async (req, res) => {
  try {
    let faculty;
    
    try {
      faculty = await Faculty.findOne({ id: req.params.id });
    } catch (dbError) {
      faculty = inMemoryFaculty.find(f => f.id === req.params.id);
    }
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    res.json({
      success: true,
      data: faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty',
      error: error.message
    });
  }
};

/**
 * Create new faculty member
 */
exports.createFaculty = async (req, res) => {
  try {
    const { id, name, department, subjectsCanTeach, availabilitySlots, maxHoursPerDay } = req.body;
    
    // Validation
    if (!id || !name || !department || !subjectsCanTeach) {
      return res.status(400).json({
        success: false,
        message: 'Please provide id, name, department, and subjectsCanTeach'
      });
    }
    
    const facultyData = {
      id,
      name,
      department,
      subjectsCanTeach,
      availabilitySlots: availabilitySlots || [],
      maxHoursPerDay: maxHoursPerDay || 6
    };
    
    let faculty;
    
    try {
      faculty = await Faculty.create(facultyData);
    } catch (dbError) {
      // Check for duplicate in memory
      if (inMemoryFaculty.find(f => f.id === id)) {
        return res.status(400).json({
          success: false,
          message: 'Faculty with this ID already exists'
        });
      }
      facultyData.createdAt = new Date();
      inMemoryFaculty.push(facultyData);
      faculty = facultyData;
    }
    
    res.status(201).json({
      success: true,
      message: 'Faculty created successfully',
      data: faculty
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Faculty with this ID already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating faculty',
      error: error.message
    });
  }
};

/**
 * Update faculty member
 */
exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    let faculty;
    
    try {
      faculty = await Faculty.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (dbError) {
      const index = inMemoryFaculty.findIndex(f => f.id === id);
      if (index !== -1) {
        inMemoryFaculty[index] = { ...inMemoryFaculty[index], ...updateData };
        faculty = inMemoryFaculty[index];
      }
    }
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Faculty updated successfully',
      data: faculty
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating faculty',
      error: error.message
    });
  }
};

/**
 * Delete faculty member
 */
exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    
    let faculty;
    
    try {
      faculty = await Faculty.findOneAndDelete({ id });
    } catch (dbError) {
      const index = inMemoryFaculty.findIndex(f => f.id === id);
      if (index !== -1) {
        faculty = inMemoryFaculty.splice(index, 1)[0];
      }
    }
    
    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: 'Faculty not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Faculty deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting faculty',
      error: error.message
    });
  }
};

/**
 * Bulk create faculty members
 */
exports.bulkCreateFaculty = async (req, res) => {
  try {
    const { faculty: facultyList } = req.body;
    
    if (!Array.isArray(facultyList) || facultyList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of faculty members'
      });
    }
    
    let created;
    
    try {
      created = await Faculty.insertMany(facultyList, { ordered: false });
    } catch (dbError) {
      // Fallback to in-memory
      created = [];
      for (const f of facultyList) {
        if (!inMemoryFaculty.find(existing => existing.id === f.id)) {
          f.createdAt = new Date();
          inMemoryFaculty.push(f);
          created.push(f);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: `${created.length} faculty members created`,
      data: created
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating faculty members',
      error: error.message
    });
  }
};

// Export in-memory storage for use in scheduler
exports.getInMemoryFaculty = () => inMemoryFaculty;
exports.setInMemoryFaculty = (data) => { inMemoryFaculty = data; };
