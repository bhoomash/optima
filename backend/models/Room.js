/**
 * Room Model
 * Represents a classroom or lab room
 */

const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['classroom', 'lab'],
    default: 'classroom'
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  building: {
    type: String,
    trim: true
  },
  floor: {
    type: Number
  },
  facilities: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);
