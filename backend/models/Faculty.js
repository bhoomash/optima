/**
 * Faculty Model
 * Represents a faculty member who can teach subjects
 */

const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
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
  }
}, { _id: false });

const facultySchema = new mongoose.Schema({
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
  subjectsCanTeach: [{
    type: String,
    required: true
  }],
  availabilitySlots: [availabilitySlotSchema],
  maxHoursPerDay: {
    type: Number,
    default: 6
  },
  preferredSlots: [availabilitySlotSchema], // Optional preference weighting
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Compound indexes for common queries
facultySchema.index({ department: 1, isActive: 1 });
facultySchema.index({ name: 'text' });

module.exports = mongoose.model('Faculty', facultySchema);
