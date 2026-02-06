/**
 * Model Index
 * Export all models from a single file
 */

const Faculty = require('./Faculty');
const Room = require('./Room');
const Subject = require('./Subject');
const Class = require('./Class');
const Timetable = require('./Timetable');

module.exports = {
  Faculty,
  Room,
  Subject,
  Class,
  Timetable
};
