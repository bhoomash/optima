/**
 * Class Model
 * Represents a student class/section
 */

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
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
  department: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8,
    index: true
  },
  section: {
    type: String,
    default: 'A'
  },
  studentCount: {
    type: Number,
    required: true,
    min: 1
  },
  subjects: [{
    type: String // Subject IDs
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
classSchema.index({ department: 1, semester: 1 });
classSchema.index({ department: 1, isActive: 1 });
classSchema.index({ name: 'text' });

module.exports = mongoose.model('Class', classSchema);
