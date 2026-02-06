/**
 * Timetable Model
 * Stores generated timetables
 */

const mongoose = require('mongoose');

const scheduleEntrySchema = new mongoose.Schema({
  classId: {
    type: String,
    required: true
  },
  className: String,
  subjectId: {
    type: String,
    required: true
  },
  subjectName: String,
  facultyId: {
    type: String,
    required: true
  },
  facultyName: String,
  roomId: {
    type: String,
    required: true
  },
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  period: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  isLab: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const timetableSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: () => `Timetable_${new Date().toISOString().split('T')[0]}`
  },
  academicYear: {
    type: String
  },
  semester: {
    type: String
  },
  schedule: [scheduleEntrySchema],
  generatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    totalClasses: Number,
    totalSubjects: Number,
    totalFaculty: Number,
    totalRooms: Number,
    generationTime: Number // in milliseconds
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
