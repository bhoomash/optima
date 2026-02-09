/**
 * Centralized In-Memory Storage
 * Single source of truth for fallback data when MongoDB is unavailable
 * 
 * WARNING: Data is lost on server restart. This is meant for development/testing only.
 * 
 * Uses Maps for O(1) lookups by ID instead of O(n) array searches.
 */

const logger = require('./logger');

class InMemoryStore {
  constructor() {
    // Using Maps for O(1) lookups by ID
    this.data = {
      users: new Map(),        // id -> user object
      faculty: new Map(),      // id -> faculty object
      rooms: new Map(),        // id -> room object
      subjects: new Map(),     // id -> subject object
      classes: new Map(),      // id -> class object
      timetables: new Map()    // id -> timetable object
    };
    
    // Secondary indexes for email lookup
    this.indexes = {
      usersByEmail: new Map()  // email -> user object
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
    return Array.from(this.data.users.values());
  }

  getUserById(id) {
    return this.data.users.get(id);
  }

  getUserByEmail(email) {
    return this.indexes.usersByEmail.get(email.toLowerCase());
  }

  addUser(user) {
    const id = user.id || this.generateId('users');
    const newUser = { ...user, id, _id: id, createdAt: new Date() };
    this.data.users.set(id, newUser);
    if (newUser.email) {
      this.indexes.usersByEmail.set(newUser.email.toLowerCase(), newUser);
    }
    return newUser;
  }

  updateUser(id, updates) {
    const user = this.data.users.get(id);
    if (!user) return null;
    const oldEmail = user.email?.toLowerCase();
    const updatedUser = { ...user, ...updates };
    this.data.users.set(id, updatedUser);
    // Update email index if email changed
    if (oldEmail && oldEmail !== updatedUser.email?.toLowerCase()) {
      this.indexes.usersByEmail.delete(oldEmail);
    }
    if (updatedUser.email) {
      this.indexes.usersByEmail.set(updatedUser.email.toLowerCase(), updatedUser);
    }
    return updatedUser;
  }

  deleteUser(id) {
    const user = this.data.users.get(id);
    if (!user) return false;
    if (user.email) {
      this.indexes.usersByEmail.delete(user.email.toLowerCase());
    }
    return this.data.users.delete(id);
  }

  // ============================================================
  // FACULTY
  // ============================================================
  
  getFaculty() {
    return Array.from(this.data.faculty.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getFacultyById(id) {
    return this.data.faculty.get(id);
  }

  addFaculty(faculty) {
    const newFaculty = { ...faculty, isActive: true, createdAt: new Date() };
    this.data.faculty.set(faculty.id, newFaculty);
    return newFaculty;
  }

  updateFaculty(id, updates) {
    const faculty = this.data.faculty.get(id);
    if (!faculty) return null;
    const updatedFaculty = { ...faculty, ...updates };
    this.data.faculty.set(id, updatedFaculty);
    return updatedFaculty;
  }

  deleteFaculty(id) {
    return this.data.faculty.delete(id);
  }

  // ============================================================
  // ROOMS
  // ============================================================
  
  getRooms() {
    return Array.from(this.data.rooms.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getRoomById(id) {
    return this.data.rooms.get(id);
  }

  addRoom(room) {
    const newRoom = { ...room, isActive: true, createdAt: new Date() };
    const roomKey = room.roomId || room.id;
    this.data.rooms.set(roomKey, newRoom);
    return newRoom;
  }

  updateRoom(id, updates) {
    const room = this.data.rooms.get(id);
    if (!room) return null;
    const updatedRoom = { ...room, ...updates };
    this.data.rooms.set(id, updatedRoom);
    return updatedRoom;
  }

  deleteRoom(id) {
    return this.data.rooms.delete(id);
  }

  // ============================================================
  // SUBJECTS
  // ============================================================
  
  getSubjects() {
    return Array.from(this.data.subjects.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getSubjectById(id) {
    return this.data.subjects.get(id);
  }

  addSubject(subject) {
    const newSubject = { ...subject, isActive: true, createdAt: new Date() };
    this.data.subjects.set(subject.id, newSubject);
    return newSubject;
  }

  updateSubject(id, updates) {
    const subject = this.data.subjects.get(id);
    if (!subject) return null;
    const updatedSubject = { ...subject, ...updates };
    this.data.subjects.set(id, updatedSubject);
    return updatedSubject;
  }

  deleteSubject(id) {
    return this.data.subjects.delete(id);
  }

  // ============================================================
  // CLASSES
  // ============================================================
  
  getClasses() {
    return Array.from(this.data.classes.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  getClassById(id) {
    return this.data.classes.get(id);
  }

  addClass(classData) {
    const newClass = { ...classData, isActive: true, createdAt: new Date() };
    this.data.classes.set(classData.id, newClass);
    return newClass;
  }

  updateClass(id, updates) {
    const classItem = this.data.classes.get(id);
    if (!classItem) return null;
    const updatedClass = { ...classItem, ...updates };
    this.data.classes.set(id, updatedClass);
    return updatedClass;
  }

  deleteClass(id) {
    return this.data.classes.delete(id);
  }

  // ============================================================
  // TIMETABLES
  // ============================================================
  
  getTimetables() {
    return Array.from(this.data.timetables.values()).sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getTimetableById(id) {
    return this.data.timetables.get(id);
  }

  getActiveTimetable() {
    return Array.from(this.data.timetables.values()).find(t => t.isActive === true);
  }

  addTimetable(timetable) {
    const id = timetable.id || this.generateId('timetables');
    // Deactivate all other timetables
    for (const [key, t] of this.data.timetables) {
      t.isActive = false;
    }
    const newTimetable = { 
      ...timetable, 
      id, 
      _id: id, 
      isActive: true, 
      createdAt: new Date() 
    };
    this.data.timetables.set(id, newTimetable);
    return newTimetable;
  }

  deleteTimetable(id) {
    return this.data.timetables.delete(id);
  }

  // ============================================================
  // UTILITY
  // ============================================================
  
  /**
   * Clear all data (useful for testing)
   */
  clear() {
    this.data = {
      users: new Map(),
      faculty: new Map(),
      rooms: new Map(),
      subjects: new Map(),
      classes: new Map(),
      timetables: new Map()
    };
    this.indexes = {
      usersByEmail: new Map()
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
        users: this.data.users.size,
        faculty: this.data.faculty.size,
        rooms: this.data.rooms.size,
        subjects: this.data.subjects.size,
        classes: this.data.classes.size,
        timetables: this.data.timetables.size
      }
    };
  }
}

// Singleton instance
const inMemoryStore = new InMemoryStore();

module.exports = inMemoryStore;
