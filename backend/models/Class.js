/**
 * Class Model
 * Represents a student class/section
 */

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
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
  department: {
    type: String,
    required: true,
    trim: true
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
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
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Class', classSchema);
