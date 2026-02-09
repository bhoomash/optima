/**
 * Subject Controller
 * Handles CRUD operations for subjects
 */

const Subject = require('../models/Subject');

// In-memory storage (fallback when MongoDB is not available)
let inMemorySubjects = [];

/**
 * Get all subjects
 * Supports pagination with ?page=1&limit=20
 * Supports filtering with ?department=CSE&semester=3&isLab=true&isActive=true
 */
exports.getAllSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 per page
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = { isActive: req.query.isActive !== 'false' }; // Default to active only
    if (req.query.department) {
      filter.department = req.query.department;
    }
    if (req.query.semester) {
      filter.semester = parseInt(req.query.semester);
    }
    if (req.query.isLab !== undefined) {
      filter.isLab = req.query.isLab === 'true';
    }
    
    let subjects, total;
    
    try {
      total = await Subject.countDocuments(filter);
      subjects = await Subject.find(filter)
        .sort({ name: 1 })
        .skip(skip)
        .limit(limit);
    } catch (dbError) {
      let filtered = inMemorySubjects.filter(s => filter.isActive ? s.isActive !== false : true);
      if (filter.department) {
        filtered = filtered.filter(s => s.department === filter.department);
      }
      if (filter.semester) {
        filtered = filtered.filter(s => s.semester === filter.semester);
      }
      if (filter.isLab !== undefined) {
        filtered = filtered.filter(s => s.isLab === filter.isLab);
      }
      total = filtered.length;
      subjects = filtered.slice(skip, skip + limit);
    }
    
    res.json({
      success: true,
      count: subjects.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: subjects
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subjects',
      error: error.message
    });
  }
};

/**
 * Get single subject by ID
 */
exports.getSubjectById = async (req, res) => {
  try {
    let subject;
    
    try {
      subject = await Subject.findOne({ id: req.params.id });
    } catch (dbError) {
      subject = inMemorySubjects.find(s => s.id === req.params.id);
    }
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.json({
      success: true,
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subject',
      error: error.message
    });
  }
};

/**
 * Create new subject
 */
exports.createSubject = async (req, res) => {
  try {
    const { id, name, code, department, weeklyHours, isLab, labHoursPerSession, semester } = req.body;
    
    // Validation
    if (!id || !name || !code || !department || !weeklyHours || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide id, name, code, department, weeklyHours, and semester'
      });
    }
    
    const subjectData = {
      id,
      name,
      code,
      department,
      weeklyHours,
      isLab: isLab || false,
      labHoursPerSession: labHoursPerSession || 2,
      semester
    };
    
    let subject;
    
    try {
      subject = await Subject.create(subjectData);
    } catch (dbError) {
      // Check for duplicate in memory
      if (inMemorySubjects.find(s => s.id === id || s.code === code)) {
        return res.status(400).json({
          success: false,
          message: 'Subject with this ID or code already exists'
        });
      }
      subjectData.createdAt = new Date();
      inMemorySubjects.push(subjectData);
      subject = subjectData;
    }
    
    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Subject with this ID or code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating subject',
      error: error.message
    });
  }
};

/**
 * Update subject
 */
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    let subject;
    
    try {
      subject = await Subject.findOneAndUpdate(
        { id },
        updateData,
        { new: true, runValidators: true }
      );
    } catch (dbError) {
      const index = inMemorySubjects.findIndex(s => s.id === id);
      if (index !== -1) {
        inMemorySubjects[index] = { ...inMemorySubjects[index], ...updateData };
        subject = inMemorySubjects[index];
      }
    }
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: subject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subject',
      error: error.message
    });
  }
};

/**
 * Delete subject
 */
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    
    let subject;
    
    try {
      subject = await Subject.findOneAndDelete({ id });
    } catch (dbError) {
      const index = inMemorySubjects.findIndex(s => s.id === id);
      if (index !== -1) {
        subject = inMemorySubjects.splice(index, 1)[0];
      }
    }
    
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting subject',
      error: error.message
    });
  }
};

/**
 * Bulk create subjects
 */
exports.bulkCreateSubjects = async (req, res) => {
  try {
    const { subjects: subjectsList } = req.body;
    
    if (!Array.isArray(subjectsList) || subjectsList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of subjects'
      });
    }
    
    let created;
    
    try {
      created = await Subject.insertMany(subjectsList, { ordered: false });
    } catch (dbError) {
      // Fallback to in-memory
      created = [];
      for (const s of subjectsList) {
        if (!inMemorySubjects.find(existing => existing.id === s.id)) {
          s.createdAt = new Date();
          inMemorySubjects.push(s);
          created.push(s);
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: `${created.length} subjects created`,
      data: created
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subjects',
      error: error.message
    });
  }
};

// Export in-memory storage for use in scheduler
exports.getInMemorySubjects = () => inMemorySubjects;
exports.setInMemorySubjects = (data) => { inMemorySubjects = data; };
