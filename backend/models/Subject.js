/**
 * Subject Model
 * Represents a subject/course that can be taught
 */

const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  department: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  weeklyHours: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  isLab: {
    type: Boolean,
    default: false,
    index: true
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
    max: 8,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
subjectSchema.index({ department: 1, semester: 1 });
subjectSchema.index({ department: 1, isActive: 1 });
subjectSchema.index({ name: 'text', code: 'text' });

module.exports = mongoose.model('Subject', subjectSchema);
