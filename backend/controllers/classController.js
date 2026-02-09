/**
 * Class Controller
 * Handles CRUD operations for classes
 */

const Class = require('../models/Class');

// In-memory storage (fallback when MongoDB is not available)
let inMemoryClasses = [];

/**
 * Get all classes
 * Supports pagination with ?page=1&limit=20
 * Supports filtering with ?department=CSE&semester=3&isActive=true
 */
exports.getAllClasses = async (req, res) => {
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
    if (req.query.semester) {
      filter.semester = parseInt(req.query.semester);
    }
    
    let classes, total;
    
    try {
      total = await Class.countDocuments(filter);
      classes = await Class.find(filter)
        .sort({ department: 1, semester: 1 })
        .skip(skip)
        .limit(limit);
    } catch (dbError) {
      let filtered = inMemoryClasses;
      if (filter.isActive !== undefined) {
        filtered = filtered.filter(c => c.isActive === filter.isActive);
      }
      if (filter.department) {
        filtered = filtered.filter(c => c.department === filter.department);
      }
      if (filter.semester) {
        filtered = filtered.filter(c => c.semester === filter.semester);
      }
      total = filtered.length;
      classes = filtered.slice(skip, skip + limit);
    }
    
    res.json({
      success: true,
      count: classes.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching classes',
      error: error.message
    });
  }
};

/**
 * Get single class by ID
 */
exports.getClassById = async (req, res) => {
  try {
    let classData;
    
    try {
      classData = await Class.findOne({ id: req.params.id });
    } catch (dbError) {
      classData = inMemoryClasses.find(c => c.id === req.params.id);
    }
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      data: classData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class',
      error: error.message
    });
  }
};

/**
 * Create new class
 */
exports.createClass = async (req, res) => {
  try {
    const { id, name, department, semester, section, studentCount, subjects } = req.body;
    
    // Validation
    if (!id || !name || !department || !semester || !studentCount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide id, name, department, semester, and studentCount'
      });
    }
    
    const classData = {
      id,
      name,
      department,
      semester,
      section: section || 'A',
      studentCount,
      subjects: subjects || []
    };
    
    let newClass;
    
    try {
      newClass = await Class.create(classData);
    } catch (dbError) {
      // Check for duplicate in memory
      if (inMemoryClasses.find(c => c.id === id)) {
        return res.status(400).json({
          success: false,
          message: 'Class with this ID already exists'
        });
      }
      classData.createdAt = new Date();
      inMemoryClasses.push(classData);
      newClass = classData;
    }
    
    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      data: newClass
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Class with this ID already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating class',
      error: error.message
    });
  }
};

/**
 * Update class
 */
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    let classData;
    
    try {
      classData = await Class.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (dbError) {
      const index = inMemoryClasses.findIndex(c => c.id === id);
      if (index !== -1) {
        inMemoryClasses[index] = { ...inMemoryClasses[index], ...updateData };
        classData = inMemoryClasses[index];
      }
    }
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Class updated successfully',
      data: classData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating class',
      error: error.message
    });
  }
};

/**
 * Delete class
 */
exports.deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    let classData;
    
    try {
      classData = await Class.findOneAndDelete({ id });
    } catch (dbError) {
      const index = inMemoryClasses.findIndex(c => c.id === id);
      if (index !== -1) {
        classData = inMemoryClasses.splice(index, 1)[0];
      }
    }
    
    if (!classData) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Class deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting class',
      error: error.message
    });
  }
};

/**
 * Bulk create classes
 */
exports.bulkCreateClasses = async (req, res) => {
  try {
    const { classes: classesList } = req.body;
    
    if (!Array.isArray(classesList) || classesList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of classes'
      });
    }
    
    let created;
    
    try {
      created = await Class.insertMany(classesList, { ordered: false });
    } catch (dbError) {
      // Fallback to in-memory
      created = [];
      for (const c of classesList) {
        if (!inMemoryClasses.find(existing => existing.id === c.id)) {
          c.createdAt = new Date();
          inMemoryClasses.push(c);
          created.push(c);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: `${created.length} classes created`,
      data: created
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating classes',
      error: error.message
    });
  }
};

// Export in-memory storage for use in scheduler
exports.getInMemoryClasses = () => inMemoryClasses;
exports.setInMemoryClasses = (data) => { inMemoryClasses = data; };
