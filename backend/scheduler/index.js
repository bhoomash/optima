/**
 * Scheduler Index
 * Export scheduler and related utilities
 */

const BacktrackingScheduler = require('./backtrackingScheduler');

/**
 * Format the generated timetable by class
 */
function formatTimetableByClass(schedule) {
  const timetableByClass = {};
  
  for (const entry of schedule) {
    if (!timetableByClass[entry.classId]) {
      timetableByClass[entry.classId] = {
        classId: entry.classId,
        className: entry.className,
        schedule: []
      };
    }
    timetableByClass[entry.classId].schedule.push(entry);
  }
  
  // Sort schedule within each class
  for (const classId in timetableByClass) {
    timetableByClass[classId].schedule.sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.period - b.period;
    });
  }
  
  return Object.values(timetableByClass);
}

/**
 * Format the generated timetable by faculty
 */
function formatTimetableByFaculty(schedule) {
  const timetableByFaculty = {};
  
  for (const entry of schedule) {
    if (!timetableByFaculty[entry.facultyId]) {
      timetableByFaculty[entry.facultyId] = {
        facultyId: entry.facultyId,
        facultyName: entry.facultyName,
        schedule: []
      };
    }
    timetableByFaculty[entry.facultyId].schedule.push(entry);
  }
  
  // Sort schedule within each faculty
  for (const facultyId in timetableByFaculty) {
    timetableByFaculty[facultyId].schedule.sort((a, b) => {
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.period - b.period;
    });
  }
  
  return Object.values(timetableByFaculty);
}

/**
 * Format timetable as a grid (Day × Period) for a specific class
 */
function formatAsGrid(schedule, classId) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  
  const grid = {};
  
  for (const day of days) {
    grid[day] = {};
    for (const period of periods) {
      grid[day][period] = null;
    }
  }
  
  const classSchedule = schedule.filter(entry => entry.classId === classId);
  
  for (const entry of classSchedule) {
    grid[entry.day][entry.period] = {
      subject: entry.subjectName,
      faculty: entry.facultyName,
      room: entry.roomId,
      isLab: entry.isLab
    };
  }
  
  return grid;
}

module.exports = {
  BacktrackingScheduler,
  formatTimetableByClass,
  formatTimetableByFaculty,
  formatAsGrid
};
