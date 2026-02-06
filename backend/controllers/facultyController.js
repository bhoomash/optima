/**
 * Faculty Controller
 * Handles CRUD operations for faculty members
 */

const Faculty = require('../models/Faculty');

// In-memory storage (fallback when MongoDB is not available)
let inMemoryFaculty = [];

/**
 * Get all faculty members
 */
exports.getAllFaculty = async (req, res) => {
  try {
    let faculty;
    
    try {
      faculty = await Faculty.find().sort({ name: 1 });
    } catch (dbError) {
      // Fallback to in-memory
      faculty = inMemoryFaculty;
    }
    
    res.json({
      success: true,
      count: faculty.length,
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
