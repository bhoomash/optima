/**
 * ============================================================
 * BACKTRACKING SCHEDULER - Core Algorithm
 * ============================================================
 * 
 * This module implements a Constraint Satisfaction Problem (CSP)
 * solver using the Backtracking algorithm to generate conflict-free
 * university timetables.
 * 
 * Key Concepts:
 * - Variables: Each (class, subject, hour) combination that needs scheduling
 * - Domain: All possible (timeslot, faculty, room) assignments
 * - Constraints: Rules that must be satisfied for a valid timetable
 * 
 * Algorithm Overview:
 * 1. Select an unassigned slot
 * 2. Try all valid combinations from the domain
 * 3. Check constraints before each assignment
 * 4. Recursively solve the remaining slots
 * 5. Backtrack if no valid assignment found
 * 6. Return success when all slots are assigned
 */

class BacktrackingScheduler {
  constructor(data) {
    // Input data
    this.classes = data.classes || [];
    this.subjects = data.subjects || [];
    this.faculty = data.faculty || [];
    this.rooms = data.rooms || [];
    
    // Time configuration
    this.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    this.periodsPerDay = 8;
    
    // Generate all possible time slots
    this.timeSlots = this.generateTimeSlots();
    
    // Solution storage
    this.schedule = [];
    
    // Tracking structures for constraint checking
    this.facultyAssignments = new Map(); // Track faculty assignments per slot
    this.roomAssignments = new Map();    // Track room assignments per slot
    this.classAssignments = new Map();   // Track class assignments per slot
    
    // Statistics
    this.backtrackCount = 0;
    this.attemptCount = 0;
  }

  /**
   * Generate all time slots (Day × Period combinations)
   */
  generateTimeSlots() {
    const slots = [];
    for (const day of this.days) {
      for (let period = 1; period <= this.periodsPerDay; period++) {
        slots.push({ day, period });
      }
    }
    return slots;
  }

  /**
   * Create a unique key for a time slot
   */
  getSlotKey(day, period) {
    return `${day}_${period}`;
  }

  /**
   * ============================================================
   * MAIN SCHEDULING FUNCTION
   * ============================================================
   * Entry point for timetable generation
   */
  generateTimetable() {
    console.log('🚀 Starting timetable generation...');
    console.log(`   Classes: ${this.classes.length}`);
    console.log(`   Subjects: ${this.subjects.length}`);
    console.log(`   Faculty: ${this.faculty.length}`);
    console.log(`   Rooms: ${this.rooms.length}`);
    
    const startTime = Date.now();
    
    // Build the list of slots that need to be scheduled
    const slotsToSchedule = this.buildSchedulingSlots();
    console.log(`   Slots to schedule: ${slotsToSchedule.length}`);
    
    if (slotsToSchedule.length === 0) {
      return {
        success: false,
        message: 'No slots to schedule. Please check input data.',
        schedule: []
      };
    }

    // Initialize tracking structures
    this.initializeTrackingStructures();
    
    // Run backtracking algorithm
    const success = this.backtrack(slotsToSchedule, 0);
    
    const endTime = Date.now();
    const generationTime = endTime - startTime;
    
    if (success) {
      console.log(`✅ Timetable generated successfully in ${generationTime}ms`);
      console.log(`   Total attempts: ${this.attemptCount}`);
      console.log(`   Backtracks: ${this.backtrackCount}`);
      
      return {
        success: true,
        message: 'Timetable generated successfully',
        schedule: this.schedule,
        metadata: {
          generationTime,
          attempts: this.attemptCount,
          backtracks: this.backtrackCount,
          totalSlots: slotsToSchedule.length
        }
      };
    } else {
      console.log(`❌ Failed to generate timetable after ${this.attemptCount} attempts`);
      
      return {
        success: false,
        message: 'Unable to generate a valid timetable with given constraints. Try relaxing some constraints or adding more resources.',
        schedule: [],
        metadata: {
          generationTime,
          attempts: this.attemptCount,
          backtracks: this.backtrackCount
        }
      };
    }
  }

  /**
   * Build the list of (class, subject, hour) slots that need scheduling
   */
  buildSchedulingSlots() {
    const slots = [];
    
    for (const cls of this.classes) {
      // Get subjects for this class based on department and semester
      const classSubjects = this.subjects.filter(sub => 
        cls.subjects?.includes(sub.id) || 
        (sub.department === cls.department && sub.semester === cls.semester)
      );
      
      for (const subject of classSubjects) {
        // For lab subjects, schedule in blocks
        if (subject.isLab) {
          const labHours = subject.labHoursPerSession || 2;
          const sessions = Math.ceil(subject.weeklyHours / labHours);
          
          for (let session = 0; session < sessions; session++) {
            slots.push({
              classId: cls.id,
              className: cls.name,
              subjectId: subject.id,
              subjectName: subject.name,
              isLab: true,
              consecutiveHours: labHours,
              sessionIndex: session
            });
          }
        } else {
          // Regular subjects - one slot per hour
          for (let hour = 0; hour < subject.weeklyHours; hour++) {
            slots.push({
              classId: cls.id,
              className: cls.name,
              subjectId: subject.id,
              subjectName: subject.name,
              isLab: false,
              consecutiveHours: 1,
              hourIndex: hour
            });
          }
        }
      }
    }
    
    // Sort slots: labs first (harder to schedule), then by class
    slots.sort((a, b) => {
      if (a.isLab !== b.isLab) return b.isLab - a.isLab;
      return a.classId.localeCompare(b.classId);
    });
    
    return slots;
  }

  /**
   * Initialize tracking structures for constraint checking
   */
  initializeTrackingStructures() {
    this.facultyAssignments.clear();
    this.roomAssignments.clear();
    this.classAssignments.clear();
    this.schedule = [];
    this.backtrackCount = 0;
    this.attemptCount = 0;
    
    // Pre-initialize maps for each time slot
    for (const slot of this.timeSlots) {
      const key = this.getSlotKey(slot.day, slot.period);
      this.facultyAssignments.set(key, new Set());
      this.roomAssignments.set(key, new Set());
      this.classAssignments.set(key, new Set());
    }
  }

  /**
   * ============================================================
   * BACKTRACKING ALGORITHM - Core recursive function
   * ============================================================
   */
  backtrack(slots, index) {
    // Base case: All slots have been assigned
    if (index >= slots.length) {
      return true;
    }
    
    const currentSlot = slots[index];
    
    // Get all valid assignments for this slot
    const validAssignments = this.getValidAssignments(currentSlot);
    
    // Try each valid assignment
    for (const assignment of validAssignments) {
      this.attemptCount++;
      
      // Make the assignment
      this.makeAssignment(currentSlot, assignment);
      
      // Recursively try to solve the rest
      if (this.backtrack(slots, index + 1)) {
        return true;
      }
      
      // Assignment didn't lead to a solution - backtrack
      this.undoAssignment(currentSlot, assignment);
      this.backtrackCount++;
    }
    
    // No valid assignment found for this slot
    return false;
  }

  /**
   * Get all valid (timeslot, faculty, room) assignments for a slot
   */
  getValidAssignments(slot) {
    const validAssignments = [];
    
    // Get faculty who can teach this subject
    const eligibleFaculty = this.faculty.filter(f => 
      f.subjectsCanTeach.includes(slot.subjectId) ||
      f.subjectsCanTeach.includes(slot.subjectName)
    );
    
    // Get appropriate rooms (classroom or lab based on subject type)
    const eligibleRooms = this.rooms.filter(r => 
      slot.isLab ? r.type === 'lab' : r.type === 'classroom'
    );
    
    // Try all combinations of timeslot × faculty × room
    for (const timeSlot of this.timeSlots) {
      for (const faculty of eligibleFaculty) {
        for (const room of eligibleRooms) {
          const assignment = {
            day: timeSlot.day,
            period: timeSlot.period,
            facultyId: faculty.id,
            facultyName: faculty.name,
            roomId: room.roomId
          };
          
          // Check if this assignment satisfies all constraints
          if (this.checkConstraints(slot, assignment)) {
            validAssignments.push(assignment);
          }
        }
      }
    }
    
    // Shuffle to add some randomness (helps find different solutions)
    this.shuffleArray(validAssignments);
    
    return validAssignments;
  }

  /**
   * ============================================================
   * CONSTRAINT CHECKING
   * ============================================================
   * Verify that an assignment satisfies all constraints
   */
  checkConstraints(slot, assignment) {
    const { day, period, facultyId, roomId } = assignment;
    
    // For lab subjects, check consecutive slots
    if (slot.isLab) {
      return this.checkLabConstraints(slot, assignment);
    }
    
    const slotKey = this.getSlotKey(day, period);
    
    // Constraint 1: Faculty cannot teach multiple classes at the same time
    if (this.facultyAssignments.get(slotKey)?.has(facultyId)) {
      return false;
    }
    
    // Constraint 2: Room cannot be used by multiple classes at the same time
    if (this.roomAssignments.get(slotKey)?.has(roomId)) {
      return false;
    }
    
    // Constraint 3: Class can only have one subject at a time
    if (this.classAssignments.get(slotKey)?.has(slot.classId)) {
      return false;
    }
    
    // Constraint 4: Check faculty availability
    if (!this.checkFacultyAvailability(facultyId, day, period)) {
      return false;
    }
    
    // Constraint 5: Avoid scheduling same subject multiple times on same day
    if (this.hasSubjectOnDay(slot.classId, slot.subjectId, day)) {
      // Allow up to 2 periods of same subject per day for flexibility
      const countOnDay = this.countSubjectOnDay(slot.classId, slot.subjectId, day);
      if (countOnDay >= 2) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check constraints specifically for lab subjects (need consecutive slots)
   */
  checkLabConstraints(slot, assignment) {
    const { day, period, facultyId, roomId } = assignment;
    const consecutiveHours = slot.consecutiveHours || 2;
    
    // Check if we have enough consecutive periods
    if (period + consecutiveHours - 1 > this.periodsPerDay) {
      return false;
    }
    
    // Check all consecutive periods
    for (let i = 0; i < consecutiveHours; i++) {
      const currentPeriod = period + i;
      const slotKey = this.getSlotKey(day, currentPeriod);
      
      // Constraint 1: Faculty available for all consecutive periods
      if (this.facultyAssignments.get(slotKey)?.has(facultyId)) {
        return false;
      }
      
      // Constraint 2: Room available for all consecutive periods
      if (this.roomAssignments.get(slotKey)?.has(roomId)) {
        return false;
      }
      
      // Constraint 3: Class free for all consecutive periods
      if (this.classAssignments.get(slotKey)?.has(slot.classId)) {
        return false;
      }
      
      // Constraint 4: Faculty availability
      if (!this.checkFacultyAvailability(facultyId, day, currentPeriod)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if faculty is available at a specific time
   */
  checkFacultyAvailability(facultyId, day, period) {
    const faculty = this.faculty.find(f => f.id === facultyId);
    if (!faculty) return false;
    
    // If no availability slots defined, assume always available
    if (!faculty.availabilitySlots || faculty.availabilitySlots.length === 0) {
      return true;
    }
    
    // Check if the slot is in availability list
    return faculty.availabilitySlots.some(
      slot => slot.day === day && slot.period === period
    );
  }

  /**
   * Check if a subject is already scheduled on a given day for a class
   */
  hasSubjectOnDay(classId, subjectId, day) {
    return this.schedule.some(
      entry => entry.classId === classId && 
               entry.subjectId === subjectId && 
               entry.day === day
    );
  }

  /**
   * Count how many times a subject is scheduled on a day for a class
   */
  countSubjectOnDay(classId, subjectId, day) {
    return this.schedule.filter(
      entry => entry.classId === classId && 
               entry.subjectId === subjectId && 
               entry.day === day
    ).length;
  }

  /**
   * ============================================================
   * ASSIGNMENT MANAGEMENT
   * ============================================================
   */
  
  /**
   * Make an assignment and update tracking structures
   */
  makeAssignment(slot, assignment) {
    const { day, period, facultyId, facultyName, roomId } = assignment;
    
    if (slot.isLab) {
      // For labs, assign multiple consecutive periods
      for (let i = 0; i < slot.consecutiveHours; i++) {
        const currentPeriod = period + i;
        const slotKey = this.getSlotKey(day, currentPeriod);
        
        this.facultyAssignments.get(slotKey).add(facultyId);
        this.roomAssignments.get(slotKey).add(roomId);
        this.classAssignments.get(slotKey).add(slot.classId);
        
        this.schedule.push({
          classId: slot.classId,
          className: slot.className,
          subjectId: slot.subjectId,
          subjectName: slot.subjectName,
          facultyId,
          facultyName,
          roomId,
          day,
          period: currentPeriod,
          isLab: true,
          labSessionPart: i + 1,
          labSessionTotal: slot.consecutiveHours
        });
      }
    } else {
      // Regular subject - single period
      const slotKey = this.getSlotKey(day, period);
      
      this.facultyAssignments.get(slotKey).add(facultyId);
      this.roomAssignments.get(slotKey).add(roomId);
      this.classAssignments.get(slotKey).add(slot.classId);
      
      this.schedule.push({
        classId: slot.classId,
        className: slot.className,
        subjectId: slot.subjectId,
        subjectName: slot.subjectName,
        facultyId,
        facultyName,
        roomId,
        day,
        period,
        isLab: false
      });
    }
  }

  /**
   * Undo an assignment (backtrack)
   */
  undoAssignment(slot, assignment) {
    const { day, period, facultyId, roomId } = assignment;
    
    if (slot.isLab) {
      // Remove all consecutive lab periods
      for (let i = 0; i < slot.consecutiveHours; i++) {
        const currentPeriod = period + i;
        const slotKey = this.getSlotKey(day, currentPeriod);
        
        this.facultyAssignments.get(slotKey).delete(facultyId);
        this.roomAssignments.get(slotKey).delete(roomId);
        this.classAssignments.get(slotKey).delete(slot.classId);
      }
      
      // Remove from schedule
      this.schedule = this.schedule.filter(entry => 
        !(entry.classId === slot.classId && 
          entry.subjectId === slot.subjectId &&
          entry.day === day &&
          entry.period >= period && 
          entry.period < period + slot.consecutiveHours)
      );
    } else {
      const slotKey = this.getSlotKey(day, period);
      
      this.facultyAssignments.get(slotKey).delete(facultyId);
      this.roomAssignments.get(slotKey).delete(roomId);
      this.classAssignments.get(slotKey).delete(slot.classId);
      
      // Remove from schedule
      this.schedule = this.schedule.filter(entry => 
        !(entry.classId === slot.classId && 
          entry.subjectId === slot.subjectId &&
          entry.day === day &&
          entry.period === period)
      );
    }
  }

  /**
   * Utility: Shuffle array (Fisher-Yates algorithm)
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}

module.exports = BacktrackingScheduler;
