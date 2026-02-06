/**
 * Timetable Controller
 * Handles timetable generation and retrieval
 */

const Timetable = require('../models/Timetable');
const Faculty = require('../models/Faculty');
const Room = require('../models/Room');
const Subject = require('../models/Subject');
const Class = require('../models/Class');
const { 
  BacktrackingScheduler, 
  formatTimetableByClass, 
  formatTimetableByFaculty,
  formatAsGrid 
} = require('../scheduler');

// In-memory controllers for fallback
const facultyController = require('./facultyController');
const roomController = require('./roomController');
const subjectController = require('./subjectController');
const classController = require('./classController');

// In-memory timetable storage
let inMemoryTimetables = [];

/**
 * Generate timetable using backtracking algorithm
 */
exports.generateTimetable = async (req, res) => {
  try {
    console.log('📋 Received timetable generation request');
    
    // Get all required data from database or in-memory
    let classes, subjects, faculty, rooms;
    
    try {
      [classes, subjects, faculty, rooms] = await Promise.all([
        Class.find(),
        Subject.find(),
        Faculty.find(),
        Room.find()
      ]);
    } catch (dbError) {
      // Fallback to in-memory data
      classes = classController.getInMemoryClasses();
      subjects = subjectController.getInMemorySubjects();
      faculty = facultyController.getInMemoryFaculty();
      rooms = roomController.getInMemoryRooms();
    }
    
    // Allow override from request body
    if (req.body.classes) classes = req.body.classes;
    if (req.body.subjects) subjects = req.body.subjects;
    if (req.body.faculty) faculty = req.body.faculty;
    if (req.body.rooms) rooms = req.body.rooms;
    
    // Validate input data
    if (!classes || classes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No classes found. Please add classes before generating timetable.'
      });
    }
    
    if (!subjects || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No subjects found. Please add subjects before generating timetable.'
      });
    }
    
    if (!faculty || faculty.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No faculty found. Please add faculty before generating timetable.'
      });
    }
    
    if (!rooms || rooms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No rooms found. Please add rooms before generating timetable.'
      });
    }
    
    // Check if we have lab rooms for lab subjects
    const hasLabSubjects = subjects.some(s => s.isLab);
    const hasLabRooms = rooms.some(r => r.type === 'lab');
    
    if (hasLabSubjects && !hasLabRooms) {
      return res.status(400).json({
        success: false,
        message: 'Lab subjects exist but no lab rooms found. Please add lab rooms.'
      });
    }
    
    console.log(`📊 Data loaded: ${classes.length} classes, ${subjects.length} subjects, ${faculty.length} faculty, ${rooms.length} rooms`);
    
    // Initialize scheduler with data
    const scheduler = new BacktrackingScheduler({
      classes: classes.map(c => c.toObject ? c.toObject() : c),
      subjects: subjects.map(s => s.toObject ? s.toObject() : s),
      faculty: faculty.map(f => f.toObject ? f.toObject() : f),
      rooms: rooms.map(r => r.toObject ? r.toObject() : r)
    });
    
    // Generate timetable
    const result = scheduler.generateTimetable();
    
    if (result.success) {
      // Format the timetable
      const timetableByClass = formatTimetableByClass(result.schedule);
      const timetableByFaculty = formatTimetableByFaculty(result.schedule);
      
      // Save timetable to database or memory
      const timetableData = {
        name: req.body.name || `Timetable_${new Date().toISOString().split('T')[0]}`,
        academicYear: req.body.academicYear,
        semester: req.body.semester,
        schedule: result.schedule,
        metadata: {
          totalClasses: classes.length,
          totalSubjects: subjects.length,
          totalFaculty: faculty.length,
          totalRooms: rooms.length,
          generationTime: result.metadata.generationTime
        }
      };
      
      let savedTimetable;
      try {
        // Deactivate previous timetables
        await Timetable.updateMany({}, { isActive: false });
        savedTimetable = await Timetable.create(timetableData);
      } catch (dbError) {
        // Fallback to in-memory
        timetableData.id = Date.now().toString();
        timetableData.createdAt = new Date();
        timetableData.isActive = true;
        inMemoryTimetables.forEach(t => t.isActive = false);
        inMemoryTimetables.push(timetableData);
        savedTimetable = timetableData;
      }
      
      res.json({
        success: true,
        message: result.message,
        data: {
          timetable: savedTimetable,
          byClass: timetableByClass,
          byFaculty: timetableByFaculty,
          metadata: result.metadata
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message,
        metadata: result.metadata
      });
    }
  } catch (error) {
    console.error('Error generating timetable:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating timetable',
      error: error.message
    });
  }
};

/**
 * Get active timetable
 */
exports.getTimetable = async (req, res) => {
  try {
    let timetable;
    
    try {
      timetable = await Timetable.findOne({ isActive: true });
    } catch (dbError) {
      timetable = inMemoryTimetables.find(t => t.isActive);
    }
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'No active timetable found. Please generate a timetable first.'
      });
    }
    
    // Format for response
    const byClass = formatTimetableByClass(timetable.schedule);
    const byFaculty = formatTimetableByFaculty(timetable.schedule);
    
    res.json({
      success: true,
      data: {
        timetable,
        byClass,
        byFaculty
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
};

/**
 * Get timetable by ID
 */
exports.getTimetableById = async (req, res) => {
  try {
    let timetable;
    
    try {
      timetable = await Timetable.findById(req.params.id);
    } catch (dbError) {
      timetable = inMemoryTimetables.find(t => t.id === req.params.id);
    }
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }
    
    const byClass = formatTimetableByClass(timetable.schedule);
    const byFaculty = formatTimetableByFaculty(timetable.schedule);
    
    res.json({
      success: true,
      data: {
        timetable,
        byClass,
        byFaculty
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
};

/**
 * Get all timetables
 */
exports.getAllTimetables = async (req, res) => {
  try {
    let timetables;
    
    try {
      timetables = await Timetable.find().sort({ createdAt: -1 });
    } catch (dbError) {
      timetables = inMemoryTimetables.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    }
    
    res.json({
      success: true,
      count: timetables.length,
      data: timetables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching timetables',
      error: error.message
    });
  }
};

/**
 * Get timetable for specific class as grid
 */
exports.getClassTimetableGrid = async (req, res) => {
  try {
    const { classId } = req.params;
    
    let timetable;
    
    try {
      timetable = await Timetable.findOne({ isActive: true });
    } catch (dbError) {
      timetable = inMemoryTimetables.find(t => t.isActive);
    }
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'No active timetable found'
      });
    }
    
    const grid = formatAsGrid(timetable.schedule, classId);
    
    res.json({
      success: true,
      data: {
        classId,
        grid
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching class timetable',
      error: error.message
    });
  }
};

/**
 * Get timetable for specific faculty
 */
exports.getFacultyTimetable = async (req, res) => {
  try {
    const { facultyId } = req.params;
    
    let timetable;
    
    try {
      timetable = await Timetable.findOne({ isActive: true });
    } catch (dbError) {
      timetable = inMemoryTimetables.find(t => t.isActive);
    }
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'No active timetable found'
      });
    }
    
    // Filter schedule for this faculty
    const facultySchedule = timetable.schedule.filter(
      entry => entry.facultyId === facultyId
    );
    
    // Get faculty info
    let faculty;
    try {
      faculty = await Faculty.findOne({ id: facultyId });
    } catch (dbError) {
      const facultyList = facultyController.getInMemoryFaculty();
      faculty = facultyList.find(f => f.id === facultyId);
    }
    
    res.json({
      success: true,
      data: {
        facultyId,
        facultyName: faculty ? faculty.name : facultyId,
        department: faculty ? faculty.department : '',
        schedule: facultySchedule,
        totalClasses: facultySchedule.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching faculty timetable',
      error: error.message
    });
  }
};

/**
 * Delete timetable
 */
exports.deleteTimetable = async (req, res) => {
  try {
    const { id } = req.params;
    
    let timetable;
    
    try {
      timetable = await Timetable.findByIdAndDelete(id);
    } catch (dbError) {
      const index = inMemoryTimetables.findIndex(t => t.id === id);
      if (index !== -1) {
        timetable = inMemoryTimetables.splice(index, 1)[0];
      }
    }
    
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Timetable deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting timetable',
      error: error.message
    });
  }
};

// Export for testing
exports.getInMemoryTimetables = () => inMemoryTimetables;
