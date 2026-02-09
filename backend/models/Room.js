/**
 * Room Model
 * Represents a classroom or lab room
 */

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
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
  type: {
    type: String,
    required: true,
    enum: ['classroom', 'lab'],
    default: 'classroom',
    index: true
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  building: {
    type: String,
    trim: true,
    index: true
  },
  floor: {
    type: Number
  },
  facilities: [{
    type: String
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
roomSchema.index({ type: 1, isActive: 1 });
roomSchema.index({ building: 1, floor: 1 });

module.exports = mongoose.model('Room', roomSchema);
