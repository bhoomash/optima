/**
 * Controllers Index
 * Export all controllers from a single file
 */

const facultyController = require('./facultyController');
const roomController = require('./roomController');
const subjectController = require('./subjectController');
const classController = require('./classController');
const timetableController = require('./timetableController');

module.exports = {
  facultyController,
  roomController,
  subjectController,
  classController,
  timetableController
};
