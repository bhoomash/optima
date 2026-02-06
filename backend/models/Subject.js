/**
 * Subject Model
 * Represents a subject/course that can be taught
 */

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  weeklyHours: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  isLab: {
    type: Boolean,
    default: false
  },
  labHoursPerSession: {
    type: Number,
    default: 2, // Labs typically need 2 consecutive hours
    min: 1,
    max: 4
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Subject', subjectSchema);
