/**
 * Centralized In-Memory Storage
 * Single source of truth for fallback data when MongoDB is unavailable
 * 
 * WARNING: Data is lost on server restart. This is meant for development/testing only.
 */

const logger = require('./logger');

class InMemoryStore {
  constructor() {
    this.data = {
      users: [],
      faculty: [],
      rooms: [],
      subjects: [],
      classes: [],
      timetables: []
    };
    
    this.counters = {
      users: 1,
      faculty: 1,
      rooms: 1,
      subjects: 1,
      classes: 1,
      timetables: 1
    };
    
    this.isActive = false;
    this._warned = false;
  }

  /**
   * Activate in-memory mode (called when MongoDB is unavailable)
   */
  activate() {
    if (!this._warned) {
      logger.warn('⚠️  Running in IN-MEMORY MODE - Data will be lost on restart!');
      logger.warn('⚠️  To persist data, ensure MongoDB is running and configured.');
      this._warned = true;
    }
    this.isActive = true;
  }

  /**
   * Check if running in memory mode
   */
  isInMemoryMode() {
    return this.isActive;
  }

  /**
   * Generate unique ID for a collection
   */
  generateId(collection) {
    return `${collection}_${this.counters[collection]++}`;
  }

  // ============================================================
  // USERS
  // ============================================================
  
  getUsers() {
    return [...this.data.users];
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id || u._id === id);
  }

  getUserByEmail(email) {
    return this.data.users.find(u => u.email === email.toLowerCase());
  }

  addUser(user) {
    const id = user.id || this.generateId('users');
    const newUser = { ...user, id, _id: id, createdAt: new Date() };
    this.data.users.push(newUser);
    return newUser;
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id || u._id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    return this.data.users[index];
  }

  deleteUser(id) {
    const index = this.data.users.findIndex(u => u.id === id || u._id === id);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    return true;
  }

  // ============================================================
  // FACULTY
  // ============================================================
  
  getFaculty() {
    return [...this.data.faculty].sort((a, b) => a.name.localeCompare(b.name));
  }

  getFacultyById(id) {
    return this.data.faculty.find(f => f.id === id);
  }

  addFaculty(faculty) {
    const newFaculty = { ...faculty, createdAt: new Date() };
    this.data.faculty.push(newFaculty);
    return newFaculty;
  }

  updateFaculty(id, updates) {
    const index = this.data.faculty.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.data.faculty[index] = { ...this.data.faculty[index], ...updates };
    return this.data.faculty[index];
  }

  deleteFaculty(id) {
    const index = this.data.faculty.findIndex(f => f.id === id);
    if (index === -1) return false;
    this.data.faculty.splice(index, 1);
    return true;
  }

  // ============================================================
  // ROOMS
  // ============================================================
  
  getRooms() {
    return [...this.data.rooms].sort((a, b) => a.name.localeCompare(b.name));
  }

  getRoomById(id) {
    return this.data.rooms.find(r => r.id === id);
  }

  addRoom(room) {
    const newRoom = { ...room, createdAt: new Date() };
    this.data.rooms.push(newRoom);
    return newRoom;
  }

  updateRoom(id, updates) {
    const index = this.data.rooms.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.data.rooms[index] = { ...this.data.rooms[index], ...updates };
    return this.data.rooms[index];
  }

  deleteRoom(id) {
    const index = this.data.rooms.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.data.rooms.splice(index, 1);
    return true;
  }

  // ============================================================
  // SUBJECTS
  // ============================================================
  
  getSubjects() {
    return [...this.data.subjects].sort((a, b) => a.name.localeCompare(b.name));
  }

  getSubjectById(id) {
    return this.data.subjects.find(s => s.id === id);
  }

  addSubject(subject) {
    const newSubject = { ...subject, createdAt: new Date() };
    this.data.subjects.push(newSubject);
    return newSubject;
  }

  updateSubject(id, updates) {
    const index = this.data.subjects.findIndex(s => s.id === id);
    if (index === -1) return null;
    this.data.subjects[index] = { ...this.data.subjects[index], ...updates };
    return this.data.subjects[index];
  }

  deleteSubject(id) {
    const index = this.data.subjects.findIndex(s => s.id === id);
    if (index === -1) return false;
    this.data.subjects.splice(index, 1);
    return true;
  }

  // ============================================================
  // CLASSES
  // ============================================================
  
  getClasses() {
    return [...this.data.classes].sort((a, b) => a.name.localeCompare(b.name));
  }

  getClassById(id) {
    return this.data.classes.find(c => c.id === id);
  }

  addClass(classData) {
    const newClass = { ...classData, createdAt: new Date() };
    this.data.classes.push(newClass);
    return newClass;
  }

  updateClass(id, updates) {
    const index = this.data.classes.findIndex(c => c.id === id);
    if (index === -1) return null;
    this.data.classes[index] = { ...this.data.classes[index], ...updates };
    return this.data.classes[index];
  }

  deleteClass(id) {
    const index = this.data.classes.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.data.classes.splice(index, 1);
    return true;
  }

  // ============================================================
  // TIMETABLES
  // ============================================================
  
  getTimetables() {
    return [...this.data.timetables].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getTimetableById(id) {
    return this.data.timetables.find(t => t.id === id || t._id === id);
  }

  getActiveTimetable() {
    return this.data.timetables.find(t => t.isActive === true);
  }

  addTimetable(timetable) {
    const id = timetable.id || this.generateId('timetables');
    // Deactivate all other timetables
    this.data.timetables.forEach(t => t.isActive = false);
    const newTimetable = { 
      ...timetable, 
      id, 
      _id: id, 
      isActive: true, 
      createdAt: new Date() 
    };
    this.data.timetables.push(newTimetable);
    return newTimetable;
  }

  deleteTimetable(id) {
    const index = this.data.timetables.findIndex(t => t.id === id || t._id === id);
    if (index === -1) return false;
    this.data.timetables.splice(index, 1);
    return true;
  }

  // ============================================================
  // UTILITY
  // ============================================================
  
  /**
   * Clear all data (useful for testing)
   */
  clear() {
    this.data = {
      users: [],
      faculty: [],
      rooms: [],
      subjects: [],
      classes: [],
      timetables: []
    };
    this.counters = {
      users: 1,
      faculty: 1,
      rooms: 1,
      subjects: 1,
      classes: 1,
      timetables: 1
    };
  }

  /**
   * Get storage statistics
   */
  getStats() {
    return {
      isActive: this.isActive,
      counts: {
        users: this.data.users.length,
        faculty: this.data.faculty.length,
        rooms: this.data.rooms.length,
        subjects: this.data.subjects.length,
        classes: this.data.classes.length,
        timetables: this.data.timetables.length
      }
    };
  }
}

// Singleton instance
const inMemoryStore = new InMemoryStore();

module.exports = inMemoryStore;
