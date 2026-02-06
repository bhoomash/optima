/**
 * Comprehensive Test Data for Smart University Scheduler
 * Contains realistic university data with multiple departments, faculty, rooms, subjects, and classes
 * 
 * Usage: node testData.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// ============================================
// FACULTY DATA - 50+ Faculty Members
// ============================================
const sampleFaculty = [
  // Computer Science Department (15 faculty)
  { id: 'FAC001', name: 'Dr. Rajesh Kumar', department: 'Computer Science', subjectsCanTeach: ['CS101', 'CS201', 'CS301'], maxHoursPerDay: 6 },
  { id: 'FAC002', name: 'Prof. Priya Sharma', department: 'Computer Science', subjectsCanTeach: ['CS102', 'CS202', 'CS302'], maxHoursPerDay: 6 },
  { id: 'FAC003', name: 'Dr. Amit Patel', department: 'Computer Science', subjectsCanTeach: ['CS103', 'CS203', 'CS303'], maxHoursPerDay: 5 },
  { id: 'FAC004', name: 'Dr. Sunita Verma', department: 'Computer Science', subjectsCanTeach: ['CS104', 'CS204', 'CS304'], maxHoursPerDay: 6 },
  { id: 'FAC005', name: 'Prof. Vikram Singh', department: 'Computer Science', subjectsCanTeach: ['CS105', 'CS205', 'CS305'], maxHoursPerDay: 6 },
  { id: 'FAC006', name: 'Dr. Anjali Gupta', department: 'Computer Science', subjectsCanTeach: ['CS101L', 'CS201L'], maxHoursPerDay: 6 },
  { id: 'FAC007', name: 'Prof. Rahul Mehta', department: 'Computer Science', subjectsCanTeach: ['CS102L', 'CS202L'], maxHoursPerDay: 5 },
  { id: 'FAC008', name: 'Dr. Neha Agarwal', department: 'Computer Science', subjectsCanTeach: ['CS103L', 'CS203L'], maxHoursPerDay: 6 },
  { id: 'FAC009', name: 'Prof. Sanjay Joshi', department: 'Computer Science', subjectsCanTeach: ['CS104L', 'CS204L'], maxHoursPerDay: 6 },
  { id: 'FAC010', name: 'Dr. Kavita Rao', department: 'Computer Science', subjectsCanTeach: ['CS105L', 'CS205L'], maxHoursPerDay: 5 },
  { id: 'FAC011', name: 'Prof. Deepak Nair', department: 'Computer Science', subjectsCanTeach: ['CS301', 'CS401', 'CS501'], maxHoursPerDay: 6 },
  { id: 'FAC012', name: 'Dr. Meena Iyer', department: 'Computer Science', subjectsCanTeach: ['CS302', 'CS402', 'CS502'], maxHoursPerDay: 6 },
  { id: 'FAC013', name: 'Prof. Arun Krishnan', department: 'Computer Science', subjectsCanTeach: ['CS303', 'CS403', 'CS503'], maxHoursPerDay: 5 },
  { id: 'FAC014', name: 'Dr. Lakshmi Menon', department: 'Computer Science', subjectsCanTeach: ['CS304', 'CS404', 'CS504'], maxHoursPerDay: 6 },
  { id: 'FAC015', name: 'Prof. Karthik Raman', department: 'Computer Science', subjectsCanTeach: ['CS305', 'CS405', 'CS505'], maxHoursPerDay: 6 },

  // Electronics & Communication (12 faculty)
  { id: 'FAC016', name: 'Dr. Ramesh Babu', department: 'Electronics', subjectsCanTeach: ['EC101', 'EC201', 'EC301'], maxHoursPerDay: 6 },
  { id: 'FAC017', name: 'Prof. Sarita Devi', department: 'Electronics', subjectsCanTeach: ['EC102', 'EC202', 'EC302'], maxHoursPerDay: 6 },
  { id: 'FAC018', name: 'Dr. Venkat Rao', department: 'Electronics', subjectsCanTeach: ['EC103', 'EC203', 'EC303'], maxHoursPerDay: 5 },
  { id: 'FAC019', name: 'Prof. Gayatri Nanda', department: 'Electronics', subjectsCanTeach: ['EC104', 'EC204', 'EC304'], maxHoursPerDay: 6 },
  { id: 'FAC020', name: 'Dr. Suresh Pillai', department: 'Electronics', subjectsCanTeach: ['EC101L', 'EC201L'], maxHoursPerDay: 6 },
  { id: 'FAC021', name: 'Prof. Anitha Kumari', department: 'Electronics', subjectsCanTeach: ['EC102L', 'EC202L'], maxHoursPerDay: 5 },
  { id: 'FAC022', name: 'Dr. Mohan Das', department: 'Electronics', subjectsCanTeach: ['EC103L', 'EC203L'], maxHoursPerDay: 6 },
  { id: 'FAC023', name: 'Prof. Radha Krishna', department: 'Electronics', subjectsCanTeach: ['EC104L', 'EC204L'], maxHoursPerDay: 6 },
  { id: 'FAC024', name: 'Dr. Prasad Reddy', department: 'Electronics', subjectsCanTeach: ['EC301', 'EC401'], maxHoursPerDay: 5 },
  { id: 'FAC025', name: 'Prof. Uma Shankar', department: 'Electronics', subjectsCanTeach: ['EC302', 'EC402'], maxHoursPerDay: 6 },
  { id: 'FAC026', name: 'Dr. Vijay Anand', department: 'Electronics', subjectsCanTeach: ['EC303', 'EC403'], maxHoursPerDay: 6 },
  { id: 'FAC027', name: 'Prof. Padma Priya', department: 'Electronics', subjectsCanTeach: ['EC304', 'EC404'], maxHoursPerDay: 5 },

  // Mechanical Engineering (12 faculty)
  { id: 'FAC028', name: 'Dr. Ashok Sharma', department: 'Mechanical', subjectsCanTeach: ['ME101', 'ME201', 'ME301'], maxHoursPerDay: 6 },
  { id: 'FAC029', name: 'Prof. Gita Bansal', department: 'Mechanical', subjectsCanTeach: ['ME102', 'ME202', 'ME302'], maxHoursPerDay: 6 },
  { id: 'FAC030', name: 'Dr. Prakash Sinha', department: 'Mechanical', subjectsCanTeach: ['ME103', 'ME203', 'ME303'], maxHoursPerDay: 5 },
  { id: 'FAC031', name: 'Prof. Rekha Mishra', department: 'Mechanical', subjectsCanTeach: ['ME104', 'ME204', 'ME304'], maxHoursPerDay: 6 },
  { id: 'FAC032', name: 'Dr. Sunil Tiwari', department: 'Mechanical', subjectsCanTeach: ['ME101L', 'ME201L'], maxHoursPerDay: 6 },
  { id: 'FAC033', name: 'Prof. Manju Saxena', department: 'Mechanical', subjectsCanTeach: ['ME102L', 'ME202L'], maxHoursPerDay: 5 },
  { id: 'FAC034', name: 'Dr. Rakesh Dubey', department: 'Mechanical', subjectsCanTeach: ['ME103L', 'ME203L'], maxHoursPerDay: 6 },
  { id: 'FAC035', name: 'Prof. Seema Chandra', department: 'Mechanical', subjectsCanTeach: ['ME104L', 'ME204L'], maxHoursPerDay: 6 },
  { id: 'FAC036', name: 'Dr. Navin Pandey', department: 'Mechanical', subjectsCanTeach: ['ME301', 'ME401'], maxHoursPerDay: 5 },
  { id: 'FAC037', name: 'Prof. Asha Tripathi', department: 'Mechanical', subjectsCanTeach: ['ME302', 'ME402'], maxHoursPerDay: 6 },
  { id: 'FAC038', name: 'Dr. Hemant Agarwal', department: 'Mechanical', subjectsCanTeach: ['ME303', 'ME403'], maxHoursPerDay: 6 },
  { id: 'FAC039', name: 'Prof. Nirmala Singh', department: 'Mechanical', subjectsCanTeach: ['ME304', 'ME404'], maxHoursPerDay: 5 },

  // Civil Engineering (10 faculty)
  { id: 'FAC040', name: 'Dr. Bhaskar Roy', department: 'Civil', subjectsCanTeach: ['CE101', 'CE201', 'CE301'], maxHoursPerDay: 6 },
  { id: 'FAC041', name: 'Prof. Kamala Das', department: 'Civil', subjectsCanTeach: ['CE102', 'CE202', 'CE302'], maxHoursPerDay: 6 },
  { id: 'FAC042', name: 'Dr. Gopal Verma', department: 'Civil', subjectsCanTeach: ['CE103', 'CE203', 'CE303'], maxHoursPerDay: 5 },
  { id: 'FAC043', name: 'Prof. Shanti Devi', department: 'Civil', subjectsCanTeach: ['CE104', 'CE204', 'CE304'], maxHoursPerDay: 6 },
  { id: 'FAC044', name: 'Dr. Manoj Kumar', department: 'Civil', subjectsCanTeach: ['CE101L', 'CE201L'], maxHoursPerDay: 6 },
  { id: 'FAC045', name: 'Prof. Saroja Nair', department: 'Civil', subjectsCanTeach: ['CE102L', 'CE202L'], maxHoursPerDay: 5 },
  { id: 'FAC046', name: 'Dr. Pankaj Mishra', department: 'Civil', subjectsCanTeach: ['CE103L', 'CE203L'], maxHoursPerDay: 6 },
  { id: 'FAC047', name: 'Prof. Vaishali Gupta', department: 'Civil', subjectsCanTeach: ['CE104L', 'CE204L'], maxHoursPerDay: 6 },
  { id: 'FAC048', name: 'Dr. Rajiv Malhotra', department: 'Civil', subjectsCanTeach: ['CE301', 'CE401'], maxHoursPerDay: 5 },
  { id: 'FAC049', name: 'Prof. Sunanda Rao', department: 'Civil', subjectsCanTeach: ['CE302', 'CE402'], maxHoursPerDay: 6 },

  // Mathematics & Basic Sciences (8 faculty)
  { id: 'FAC050', name: 'Dr. Arvind Mathur', department: 'Mathematics', subjectsCanTeach: ['MA101', 'MA201', 'MA301'], maxHoursPerDay: 6 },
  { id: 'FAC051', name: 'Prof. Savitri Dutta', department: 'Mathematics', subjectsCanTeach: ['MA102', 'MA202', 'MA302'], maxHoursPerDay: 6 },
  { id: 'FAC052', name: 'Dr. Kishore Bhatt', department: 'Mathematics', subjectsCanTeach: ['MA101', 'MA102', 'MA201'], maxHoursPerDay: 5 },
  { id: 'FAC053', name: 'Prof. Lalita Sharma', department: 'Mathematics', subjectsCanTeach: ['MA201', 'MA202', 'MA301'], maxHoursPerDay: 6 },
  { id: 'FAC054', name: 'Dr. Ravi Shankar', department: 'Physics', subjectsCanTeach: ['PH101', 'PH201'], maxHoursPerDay: 6 },
  { id: 'FAC055', name: 'Prof. Geeta Jain', department: 'Physics', subjectsCanTeach: ['PH101L', 'PH201L'], maxHoursPerDay: 5 },
  { id: 'FAC056', name: 'Dr. Satish Chandra', department: 'Chemistry', subjectsCanTeach: ['CH101', 'CH201'], maxHoursPerDay: 6 },
  { id: 'FAC057', name: 'Prof. Usha Rani', department: 'Chemistry', subjectsCanTeach: ['CH101L', 'CH201L'], maxHoursPerDay: 6 },

  // English & Humanities (5 faculty)
  { id: 'FAC058', name: 'Dr. Anand Sharma', department: 'Humanities', subjectsCanTeach: ['EN101', 'EN201', 'MG101'], maxHoursPerDay: 6 },
  { id: 'FAC059', name: 'Prof. Preeti Singh', department: 'Humanities', subjectsCanTeach: ['EN101', 'EN201', 'MG102'], maxHoursPerDay: 6 },
  { id: 'FAC060', name: 'Dr. Vijay Kumar', department: 'Humanities', subjectsCanTeach: ['MG101', 'MG102', 'MG201'], maxHoursPerDay: 5 },
];

// ============================================
// ROOMS DATA - 40+ Rooms
// ============================================
const sampleRooms = [
  // Main Building - Classrooms
  { roomId: 'MB101', name: 'Main Block 101', type: 'classroom', capacity: 80, building: 'Main Block', floor: 1 },
  { roomId: 'MB102', name: 'Main Block 102', type: 'classroom', capacity: 80, building: 'Main Block', floor: 1 },
  { roomId: 'MB103', name: 'Main Block 103', type: 'classroom', capacity: 60, building: 'Main Block', floor: 1 },
  { roomId: 'MB104', name: 'Main Block 104', type: 'classroom', capacity: 60, building: 'Main Block', floor: 1 },
  { roomId: 'MB201', name: 'Main Block 201', type: 'classroom', capacity: 80, building: 'Main Block', floor: 2 },
  { roomId: 'MB202', name: 'Main Block 202', type: 'classroom', capacity: 80, building: 'Main Block', floor: 2 },
  { roomId: 'MB203', name: 'Main Block 203', type: 'classroom', capacity: 60, building: 'Main Block', floor: 2 },
  { roomId: 'MB204', name: 'Main Block 204', type: 'classroom', capacity: 60, building: 'Main Block', floor: 2 },
  { roomId: 'MB301', name: 'Main Block 301', type: 'classroom', capacity: 80, building: 'Main Block', floor: 3 },
  { roomId: 'MB302', name: 'Main Block 302', type: 'classroom', capacity: 80, building: 'Main Block', floor: 3 },
  { roomId: 'MB303', name: 'Main Block 303', type: 'classroom', capacity: 60, building: 'Main Block', floor: 3 },
  { roomId: 'MB304', name: 'Main Block 304', type: 'classroom', capacity: 60, building: 'Main Block', floor: 3 },

  // Academic Block - Classrooms
  { roomId: 'AB101', name: 'Academic Block 101', type: 'classroom', capacity: 70, building: 'Academic Block', floor: 1 },
  { roomId: 'AB102', name: 'Academic Block 102', type: 'classroom', capacity: 70, building: 'Academic Block', floor: 1 },
  { roomId: 'AB103', name: 'Academic Block 103', type: 'classroom', capacity: 50, building: 'Academic Block', floor: 1 },
  { roomId: 'AB201', name: 'Academic Block 201', type: 'classroom', capacity: 70, building: 'Academic Block', floor: 2 },
  { roomId: 'AB202', name: 'Academic Block 202', type: 'classroom', capacity: 70, building: 'Academic Block', floor: 2 },
  { roomId: 'AB203', name: 'Academic Block 203', type: 'classroom', capacity: 50, building: 'Academic Block', floor: 2 },

  // Computer Science Labs
  { roomId: 'CSL01', name: 'Computer Lab 1', type: 'lab', capacity: 40, building: 'CS Block', floor: 1 },
  { roomId: 'CSL02', name: 'Computer Lab 2', type: 'lab', capacity: 40, building: 'CS Block', floor: 1 },
  { roomId: 'CSL03', name: 'Computer Lab 3', type: 'lab', capacity: 35, building: 'CS Block', floor: 2 },
  { roomId: 'CSL04', name: 'Computer Lab 4', type: 'lab', capacity: 35, building: 'CS Block', floor: 2 },
  { roomId: 'CSL05', name: 'AI/ML Lab', type: 'lab', capacity: 30, building: 'CS Block', floor: 3 },
  { roomId: 'CSL06', name: 'Network Lab', type: 'lab', capacity: 30, building: 'CS Block', floor: 3 },

  // Electronics Labs
  { roomId: 'ECL01', name: 'Electronics Lab 1', type: 'lab', capacity: 35, building: 'EC Block', floor: 1 },
  { roomId: 'ECL02', name: 'Electronics Lab 2', type: 'lab', capacity: 35, building: 'EC Block', floor: 1 },
  { roomId: 'ECL03', name: 'Communication Lab', type: 'lab', capacity: 30, building: 'EC Block', floor: 2 },
  { roomId: 'ECL04', name: 'VLSI Lab', type: 'lab', capacity: 30, building: 'EC Block', floor: 2 },

  // Mechanical Labs
  { roomId: 'MEL01', name: 'Workshop 1', type: 'lab', capacity: 40, building: 'Workshop', floor: 0 },
  { roomId: 'MEL02', name: 'Workshop 2', type: 'lab', capacity: 40, building: 'Workshop', floor: 0 },
  { roomId: 'MEL03', name: 'CAD/CAM Lab', type: 'lab', capacity: 35, building: 'ME Block', floor: 1 },
  { roomId: 'MEL04', name: 'Thermal Lab', type: 'lab', capacity: 30, building: 'ME Block', floor: 1 },

  // Civil Labs
  { roomId: 'CEL01', name: 'Survey Lab', type: 'lab', capacity: 35, building: 'CE Block', floor: 1 },
  { roomId: 'CEL02', name: 'Material Testing Lab', type: 'lab', capacity: 30, building: 'CE Block', floor: 1 },
  { roomId: 'CEL03', name: 'Environmental Lab', type: 'lab', capacity: 30, building: 'CE Block', floor: 2 },

  // Science Labs
  { roomId: 'PHL01', name: 'Physics Lab 1', type: 'lab', capacity: 40, building: 'Science Block', floor: 1 },
  { roomId: 'PHL02', name: 'Physics Lab 2', type: 'lab', capacity: 40, building: 'Science Block', floor: 1 },
  { roomId: 'CHL01', name: 'Chemistry Lab 1', type: 'lab', capacity: 40, building: 'Science Block', floor: 2 },
  { roomId: 'CHL02', name: 'Chemistry Lab 2', type: 'lab', capacity: 40, building: 'Science Block', floor: 2 },

  // Seminar Halls
  { roomId: 'SH01', name: 'Seminar Hall 1', type: 'classroom', capacity: 120, building: 'Main Block', floor: 1 },
  { roomId: 'SH02', name: 'Seminar Hall 2', type: 'classroom', capacity: 100, building: 'Academic Block', floor: 1 },
];

// ============================================
// SUBJECTS DATA - 80+ Subjects
// ============================================
const sampleSubjects = [
  // Computer Science - Semester 1 & 2
  { id: 'CS101', name: 'Programming Fundamentals', code: 'CS101', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 1 },
  { id: 'CS101L', name: 'Programming Lab', code: 'CS101L', department: 'Computer Science', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 1 },
  { id: 'CS102', name: 'Digital Logic Design', code: 'CS102', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 1 },
  { id: 'CS102L', name: 'Digital Logic Lab', code: 'CS102L', department: 'Computer Science', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 1 },
  { id: 'CS103', name: 'Discrete Mathematics', code: 'CS103', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 2 },
  { id: 'CS103L', name: 'Discrete Math Lab', code: 'CS103L', department: 'Computer Science', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },
  { id: 'CS104', name: 'Object Oriented Programming', code: 'CS104', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 2 },
  { id: 'CS104L', name: 'OOP Lab', code: 'CS104L', department: 'Computer Science', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 2 },
  { id: 'CS105', name: 'Computer Organization', code: 'CS105', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 2 },
  { id: 'CS105L', name: 'Computer Org Lab', code: 'CS105L', department: 'Computer Science', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },

  // Computer Science - Semester 3 & 4
  { id: 'CS201', name: 'Data Structures', code: 'CS201', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 3 },
  { id: 'CS201L', name: 'Data Structures Lab', code: 'CS201L', department: 'Computer Science', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 3 },
  { id: 'CS202', name: 'Database Management Systems', code: 'CS202', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 3 },
  { id: 'CS202L', name: 'DBMS Lab', code: 'CS202L', department: 'Computer Science', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 3 },
  { id: 'CS203', name: 'Operating Systems', code: 'CS203', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 4 },
  { id: 'CS203L', name: 'OS Lab', code: 'CS203L', department: 'Computer Science', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 4 },
  { id: 'CS204', name: 'Computer Networks', code: 'CS204', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 4 },
  { id: 'CS204L', name: 'Networks Lab', code: 'CS204L', department: 'Computer Science', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 4 },
  { id: 'CS205', name: 'Theory of Computation', code: 'CS205', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 4 },
  { id: 'CS205L', name: 'TOC Lab', code: 'CS205L', department: 'Computer Science', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 4 },

  // Computer Science - Semester 5 & 6
  { id: 'CS301', name: 'Design & Analysis of Algorithms', code: 'CS301', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 5 },
  { id: 'CS302', name: 'Software Engineering', code: 'CS302', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 5 },
  { id: 'CS303', name: 'Web Technologies', code: 'CS303', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 5 },
  { id: 'CS304', name: 'Artificial Intelligence', code: 'CS304', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 6 },
  { id: 'CS305', name: 'Machine Learning', code: 'CS305', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 6 },

  // Computer Science - Semester 7 & 8
  { id: 'CS401', name: 'Compiler Design', code: 'CS401', department: 'Computer Science', weeklyHours: 4, isLab: false, semester: 7 },
  { id: 'CS402', name: 'Cloud Computing', code: 'CS402', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'CS403', name: 'Information Security', code: 'CS403', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'CS404', name: 'Deep Learning', code: 'CS404', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 8 },
  { id: 'CS405', name: 'Big Data Analytics', code: 'CS405', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 8 },
  { id: 'CS501', name: 'Blockchain Technology', code: 'CS501', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'CS502', name: 'Internet of Things', code: 'CS502', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 8 },
  { id: 'CS503', name: 'Natural Language Processing', code: 'CS503', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 8 },
  { id: 'CS504', name: 'Computer Vision', code: 'CS504', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'CS505', name: 'Distributed Systems', code: 'CS505', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 8 },

  // Electronics - Semester 1 to 4
  { id: 'EC101', name: 'Basic Electronics', code: 'EC101', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 1 },
  { id: 'EC101L', name: 'Basic Electronics Lab', code: 'EC101L', department: 'Electronics', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 1 },
  { id: 'EC102', name: 'Circuit Theory', code: 'EC102', department: 'Electronics', weeklyHours: 3, isLab: false, semester: 1 },
  { id: 'EC102L', name: 'Circuit Lab', code: 'EC102L', department: 'Electronics', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 1 },
  { id: 'EC103', name: 'Signals & Systems', code: 'EC103', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 2 },
  { id: 'EC103L', name: 'Signals Lab', code: 'EC103L', department: 'Electronics', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },
  { id: 'EC104', name: 'Analog Electronics', code: 'EC104', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 2 },
  { id: 'EC104L', name: 'Analog Lab', code: 'EC104L', department: 'Electronics', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 2 },
  { id: 'EC201', name: 'Digital Electronics', code: 'EC201', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 3 },
  { id: 'EC201L', name: 'Digital Electronics Lab', code: 'EC201L', department: 'Electronics', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 3 },
  { id: 'EC202', name: 'Microprocessors', code: 'EC202', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 3 },
  { id: 'EC202L', name: 'Microprocessor Lab', code: 'EC202L', department: 'Electronics', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 3 },
  { id: 'EC203', name: 'Communication Systems', code: 'EC203', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 4 },
  { id: 'EC203L', name: 'Communication Lab', code: 'EC203L', department: 'Electronics', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 4 },
  { id: 'EC204', name: 'Control Systems', code: 'EC204', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 4 },
  { id: 'EC204L', name: 'Control Systems Lab', code: 'EC204L', department: 'Electronics', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 4 },

  // Electronics - Semester 5 to 8
  { id: 'EC301', name: 'VLSI Design', code: 'EC301', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 5 },
  { id: 'EC302', name: 'Digital Signal Processing', code: 'EC302', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 5 },
  { id: 'EC303', name: 'Embedded Systems', code: 'EC303', department: 'Electronics', weeklyHours: 4, isLab: false, semester: 6 },
  { id: 'EC304', name: 'Wireless Communication', code: 'EC304', department: 'Electronics', weeklyHours: 3, isLab: false, semester: 6 },
  { id: 'EC401', name: 'RF & Microwave Engineering', code: 'EC401', department: 'Electronics', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'EC402', name: 'Optical Communication', code: 'EC402', department: 'Electronics', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'EC403', name: 'Antenna Design', code: 'EC403', department: 'Electronics', weeklyHours: 3, isLab: false, semester: 8 },
  { id: 'EC404', name: 'Satellite Communication', code: 'EC404', department: 'Electronics', weeklyHours: 3, isLab: false, semester: 8 },

  // Mechanical Engineering
  { id: 'ME101', name: 'Engineering Mechanics', code: 'ME101', department: 'Mechanical', weeklyHours: 4, isLab: false, semester: 1 },
  { id: 'ME101L', name: 'Workshop Practice 1', code: 'ME101L', department: 'Mechanical', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 1 },
  { id: 'ME102', name: 'Engineering Graphics', code: 'ME102', department: 'Mechanical', weeklyHours: 3, isLab: false, semester: 1 },
  { id: 'ME102L', name: 'Graphics Lab', code: 'ME102L', department: 'Mechanical', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 1 },
  { id: 'ME103', name: 'Thermodynamics', code: 'ME103', department: 'Mechanical', weeklyHours: 4, isLab: false, semester: 2 },
  { id: 'ME103L', name: 'Thermodynamics Lab', code: 'ME103L', department: 'Mechanical', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },
  { id: 'ME104', name: 'Material Science', code: 'ME104', department: 'Mechanical', weeklyHours: 3, isLab: false, semester: 2 },
  { id: 'ME104L', name: 'Material Testing Lab', code: 'ME104L', department: 'Mechanical', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },
  { id: 'ME201', name: 'Strength of Materials', code: 'ME201', department: 'Mechanical', weeklyHours: 4, isLab: false, semester: 3 },
  { id: 'ME201L', name: 'SOM Lab', code: 'ME201L', department: 'Mechanical', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 3 },
  { id: 'ME202', name: 'Fluid Mechanics', code: 'ME202', department: 'Mechanical', weeklyHours: 4, isLab: false, semester: 3 },
  { id: 'ME202L', name: 'Fluid Mechanics Lab', code: 'ME202L', department: 'Mechanical', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 3 },
  { id: 'ME203', name: 'Manufacturing Processes', code: 'ME203', department: 'Mechanical', weeklyHours: 4, isLab: false, semester: 4 },
  { id: 'ME203L', name: 'Manufacturing Lab', code: 'ME203L', department: 'Mechanical', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 4 },
  { id: 'ME204', name: 'Machine Design', code: 'ME204', department: 'Mechanical', weeklyHours: 4, isLab: false, semester: 4 },
  { id: 'ME204L', name: 'CAD Lab', code: 'ME204L', department: 'Mechanical', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 4 },
  { id: 'ME301', name: 'Heat Transfer', code: 'ME301', department: 'Mechanical', weeklyHours: 4, isLab: false, semester: 5 },
  { id: 'ME302', name: 'IC Engines', code: 'ME302', department: 'Mechanical', weeklyHours: 4, isLab: false, semester: 5 },
  { id: 'ME303', name: 'Robotics', code: 'ME303', department: 'Mechanical', weeklyHours: 3, isLab: false, semester: 6 },
  { id: 'ME304', name: 'Automobile Engineering', code: 'ME304', department: 'Mechanical', weeklyHours: 3, isLab: false, semester: 6 },
  { id: 'ME401', name: 'Finite Element Analysis', code: 'ME401', department: 'Mechanical', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'ME402', name: 'Industrial Automation', code: 'ME402', department: 'Mechanical', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'ME403', name: 'Power Plant Engineering', code: 'ME403', department: 'Mechanical', weeklyHours: 3, isLab: false, semester: 8 },
  { id: 'ME404', name: 'Refrigeration & AC', code: 'ME404', department: 'Mechanical', weeklyHours: 3, isLab: false, semester: 8 },

  // Civil Engineering
  { id: 'CE101', name: 'Engineering Surveying', code: 'CE101', department: 'Civil', weeklyHours: 4, isLab: false, semester: 1 },
  { id: 'CE101L', name: 'Surveying Lab', code: 'CE101L', department: 'Civil', weeklyHours: 3, isLab: true, labHoursPerSession: 3, semester: 1 },
  { id: 'CE102', name: 'Building Materials', code: 'CE102', department: 'Civil', weeklyHours: 3, isLab: false, semester: 1 },
  { id: 'CE102L', name: 'Materials Lab', code: 'CE102L', department: 'Civil', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 1 },
  { id: 'CE103', name: 'Structural Analysis', code: 'CE103', department: 'Civil', weeklyHours: 4, isLab: false, semester: 2 },
  { id: 'CE103L', name: 'Structural Analysis Lab', code: 'CE103L', department: 'Civil', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },
  { id: 'CE104', name: 'Geotechnical Engineering', code: 'CE104', department: 'Civil', weeklyHours: 4, isLab: false, semester: 2 },
  { id: 'CE104L', name: 'Soil Mechanics Lab', code: 'CE104L', department: 'Civil', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },
  { id: 'CE201', name: 'Concrete Technology', code: 'CE201', department: 'Civil', weeklyHours: 4, isLab: false, semester: 3 },
  { id: 'CE201L', name: 'Concrete Lab', code: 'CE201L', department: 'Civil', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 3 },
  { id: 'CE202', name: 'Hydraulics', code: 'CE202', department: 'Civil', weeklyHours: 4, isLab: false, semester: 3 },
  { id: 'CE202L', name: 'Hydraulics Lab', code: 'CE202L', department: 'Civil', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 3 },
  { id: 'CE203', name: 'Transportation Engineering', code: 'CE203', department: 'Civil', weeklyHours: 4, isLab: false, semester: 4 },
  { id: 'CE203L', name: 'Transportation Lab', code: 'CE203L', department: 'Civil', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 4 },
  { id: 'CE204', name: 'Environmental Engineering', code: 'CE204', department: 'Civil', weeklyHours: 4, isLab: false, semester: 4 },
  { id: 'CE204L', name: 'Environmental Lab', code: 'CE204L', department: 'Civil', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 4 },
  { id: 'CE301', name: 'Steel Structures', code: 'CE301', department: 'Civil', weeklyHours: 4, isLab: false, semester: 5 },
  { id: 'CE302', name: 'Foundation Engineering', code: 'CE302', department: 'Civil', weeklyHours: 4, isLab: false, semester: 5 },
  { id: 'CE303', name: 'Water Resources', code: 'CE303', department: 'Civil', weeklyHours: 3, isLab: false, semester: 6 },
  { id: 'CE304', name: 'Construction Management', code: 'CE304', department: 'Civil', weeklyHours: 3, isLab: false, semester: 6 },
  { id: 'CE401', name: 'Earthquake Engineering', code: 'CE401', department: 'Civil', weeklyHours: 3, isLab: false, semester: 7 },
  { id: 'CE402', name: 'Remote Sensing & GIS', code: 'CE402', department: 'Civil', weeklyHours: 3, isLab: false, semester: 7 },

  // Mathematics & Sciences (Common)
  { id: 'MA101', name: 'Engineering Mathematics I', code: 'MA101', department: 'Mathematics', weeklyHours: 4, isLab: false, semester: 1 },
  { id: 'MA102', name: 'Engineering Mathematics II', code: 'MA102', department: 'Mathematics', weeklyHours: 4, isLab: false, semester: 2 },
  { id: 'MA201', name: 'Probability & Statistics', code: 'MA201', department: 'Mathematics', weeklyHours: 3, isLab: false, semester: 3 },
  { id: 'MA202', name: 'Numerical Methods', code: 'MA202', department: 'Mathematics', weeklyHours: 3, isLab: false, semester: 4 },
  { id: 'MA301', name: 'Linear Algebra', code: 'MA301', department: 'Mathematics', weeklyHours: 3, isLab: false, semester: 3 },
  { id: 'MA302', name: 'Complex Analysis', code: 'MA302', department: 'Mathematics', weeklyHours: 3, isLab: false, semester: 4 },
  { id: 'PH101', name: 'Engineering Physics', code: 'PH101', department: 'Physics', weeklyHours: 3, isLab: false, semester: 1 },
  { id: 'PH101L', name: 'Physics Lab', code: 'PH101L', department: 'Physics', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 1 },
  { id: 'PH201', name: 'Applied Physics', code: 'PH201', department: 'Physics', weeklyHours: 3, isLab: false, semester: 2 },
  { id: 'PH201L', name: 'Applied Physics Lab', code: 'PH201L', department: 'Physics', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },
  { id: 'CH101', name: 'Engineering Chemistry', code: 'CH101', department: 'Chemistry', weeklyHours: 3, isLab: false, semester: 1 },
  { id: 'CH101L', name: 'Chemistry Lab', code: 'CH101L', department: 'Chemistry', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 1 },
  { id: 'CH201', name: 'Environmental Chemistry', code: 'CH201', department: 'Chemistry', weeklyHours: 3, isLab: false, semester: 2 },
  { id: 'CH201L', name: 'Env Chemistry Lab', code: 'CH201L', department: 'Chemistry', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 2 },

  // Humanities
  { id: 'EN101', name: 'Technical English', code: 'EN101', department: 'Humanities', weeklyHours: 3, isLab: false, semester: 1 },
  { id: 'EN201', name: 'Business Communication', code: 'EN201', department: 'Humanities', weeklyHours: 2, isLab: false, semester: 2 },
  { id: 'MG101', name: 'Engineering Economics', code: 'MG101', department: 'Humanities', weeklyHours: 3, isLab: false, semester: 5 },
  { id: 'MG102', name: 'Professional Ethics', code: 'MG102', department: 'Humanities', weeklyHours: 2, isLab: false, semester: 6 },
  { id: 'MG201', name: 'Project Management', code: 'MG201', department: 'Humanities', weeklyHours: 3, isLab: false, semester: 7 },
];

// ============================================
// CLASSES DATA - 40+ Classes
// ============================================
const sampleClasses = [
  // Computer Science - 8 sections across 4 years
  { id: 'CS1A', name: 'CS 1st Year Sec A', department: 'Computer Science', semester: 1, section: 'A', studentCount: 65, 
    subjects: ['CS101', 'CS101L', 'CS102', 'CS102L', 'MA101', 'PH101', 'PH101L', 'EN101'] },
  { id: 'CS1B', name: 'CS 1st Year Sec B', department: 'Computer Science', semester: 1, section: 'B', studentCount: 60, 
    subjects: ['CS101', 'CS101L', 'CS102', 'CS102L', 'MA101', 'PH101', 'PH101L', 'EN101'] },
  { id: 'CS2A', name: 'CS 2nd Year Sec A', department: 'Computer Science', semester: 3, section: 'A', studentCount: 62, 
    subjects: ['CS201', 'CS201L', 'CS202', 'CS202L', 'CS103', 'MA201', 'MA301'] },
  { id: 'CS2B', name: 'CS 2nd Year Sec B', department: 'Computer Science', semester: 3, section: 'B', studentCount: 58, 
    subjects: ['CS201', 'CS201L', 'CS202', 'CS202L', 'CS103', 'MA201', 'MA301'] },
  { id: 'CS3A', name: 'CS 3rd Year Sec A', department: 'Computer Science', semester: 5, section: 'A', studentCount: 55, 
    subjects: ['CS301', 'CS302', 'CS303', 'CS203', 'CS203L', 'MG101'] },
  { id: 'CS3B', name: 'CS 3rd Year Sec B', department: 'Computer Science', semester: 5, section: 'B', studentCount: 52, 
    subjects: ['CS301', 'CS302', 'CS303', 'CS203', 'CS203L', 'MG101'] },
  { id: 'CS4A', name: 'CS 4th Year Sec A', department: 'Computer Science', semester: 7, section: 'A', studentCount: 50, 
    subjects: ['CS401', 'CS402', 'CS403', 'CS501', 'CS504', 'MG201'] },
  { id: 'CS4B', name: 'CS 4th Year Sec B', department: 'Computer Science', semester: 7, section: 'B', studentCount: 48, 
    subjects: ['CS401', 'CS402', 'CS403', 'CS501', 'CS504', 'MG201'] },

  // Electronics - 8 sections across 4 years
  { id: 'EC1A', name: 'EC 1st Year Sec A', department: 'Electronics', semester: 1, section: 'A', studentCount: 60, 
    subjects: ['EC101', 'EC101L', 'EC102', 'EC102L', 'MA101', 'PH101', 'PH101L', 'EN101'] },
  { id: 'EC1B', name: 'EC 1st Year Sec B', department: 'Electronics', semester: 1, section: 'B', studentCount: 58, 
    subjects: ['EC101', 'EC101L', 'EC102', 'EC102L', 'MA101', 'PH101', 'PH101L', 'EN101'] },
  { id: 'EC2A', name: 'EC 2nd Year Sec A', department: 'Electronics', semester: 3, section: 'A', studentCount: 55, 
    subjects: ['EC201', 'EC201L', 'EC202', 'EC202L', 'EC103', 'MA201', 'MA301'] },
  { id: 'EC2B', name: 'EC 2nd Year Sec B', department: 'Electronics', semester: 3, section: 'B', studentCount: 52, 
    subjects: ['EC201', 'EC201L', 'EC202', 'EC202L', 'EC103', 'MA201', 'MA301'] },
  { id: 'EC3A', name: 'EC 3rd Year Sec A', department: 'Electronics', semester: 5, section: 'A', studentCount: 50, 
    subjects: ['EC301', 'EC302', 'EC203', 'EC203L', 'EC204', 'MG101'] },
  { id: 'EC3B', name: 'EC 3rd Year Sec B', department: 'Electronics', semester: 5, section: 'B', studentCount: 48, 
    subjects: ['EC301', 'EC302', 'EC203', 'EC203L', 'EC204', 'MG101'] },
  { id: 'EC4A', name: 'EC 4th Year Sec A', department: 'Electronics', semester: 7, section: 'A', studentCount: 45, 
    subjects: ['EC303', 'EC304', 'EC401', 'EC402', 'MG201'] },
  { id: 'EC4B', name: 'EC 4th Year Sec B', department: 'Electronics', semester: 7, section: 'B', studentCount: 42, 
    subjects: ['EC303', 'EC304', 'EC401', 'EC402', 'MG201'] },

  // Mechanical - 8 sections across 4 years
  { id: 'ME1A', name: 'ME 1st Year Sec A', department: 'Mechanical', semester: 1, section: 'A', studentCount: 70, 
    subjects: ['ME101', 'ME101L', 'ME102', 'ME102L', 'MA101', 'CH101', 'CH101L', 'EN101'] },
  { id: 'ME1B', name: 'ME 1st Year Sec B', department: 'Mechanical', semester: 1, section: 'B', studentCount: 68, 
    subjects: ['ME101', 'ME101L', 'ME102', 'ME102L', 'MA101', 'CH101', 'CH101L', 'EN101'] },
  { id: 'ME2A', name: 'ME 2nd Year Sec A', department: 'Mechanical', semester: 3, section: 'A', studentCount: 65, 
    subjects: ['ME201', 'ME201L', 'ME202', 'ME202L', 'ME103', 'MA201', 'MA301'] },
  { id: 'ME2B', name: 'ME 2nd Year Sec B', department: 'Mechanical', semester: 3, section: 'B', studentCount: 62, 
    subjects: ['ME201', 'ME201L', 'ME202', 'ME202L', 'ME103', 'MA201', 'MA301'] },
  { id: 'ME3A', name: 'ME 3rd Year Sec A', department: 'Mechanical', semester: 5, section: 'A', studentCount: 58, 
    subjects: ['ME301', 'ME302', 'ME203', 'ME203L', 'ME204', 'MG101'] },
  { id: 'ME3B', name: 'ME 3rd Year Sec B', department: 'Mechanical', semester: 5, section: 'B', studentCount: 55, 
    subjects: ['ME301', 'ME302', 'ME203', 'ME203L', 'ME204', 'MG101'] },
  { id: 'ME4A', name: 'ME 4th Year Sec A', department: 'Mechanical', semester: 7, section: 'A', studentCount: 52, 
    subjects: ['ME303', 'ME304', 'ME401', 'ME402', 'MG201'] },
  { id: 'ME4B', name: 'ME 4th Year Sec B', department: 'Mechanical', semester: 7, section: 'B', studentCount: 50, 
    subjects: ['ME303', 'ME304', 'ME401', 'ME402', 'MG201'] },

  // Civil - 8 sections across 4 years
  { id: 'CE1A', name: 'CE 1st Year Sec A', department: 'Civil', semester: 1, section: 'A', studentCount: 65, 
    subjects: ['CE101', 'CE101L', 'CE102', 'CE102L', 'MA101', 'PH101', 'PH101L', 'EN101'] },
  { id: 'CE1B', name: 'CE 1st Year Sec B', department: 'Civil', semester: 1, section: 'B', studentCount: 62, 
    subjects: ['CE101', 'CE101L', 'CE102', 'CE102L', 'MA101', 'PH101', 'PH101L', 'EN101'] },
  { id: 'CE2A', name: 'CE 2nd Year Sec A', department: 'Civil', semester: 3, section: 'A', studentCount: 58, 
    subjects: ['CE201', 'CE201L', 'CE202', 'CE202L', 'CE103', 'MA201', 'MA301'] },
  { id: 'CE2B', name: 'CE 2nd Year Sec B', department: 'Civil', semester: 3, section: 'B', studentCount: 55, 
    subjects: ['CE201', 'CE201L', 'CE202', 'CE202L', 'CE103', 'MA201', 'MA301'] },
  { id: 'CE3A', name: 'CE 3rd Year Sec A', department: 'Civil', semester: 5, section: 'A', studentCount: 52, 
    subjects: ['CE301', 'CE302', 'CE203', 'CE203L', 'CE204', 'MG101'] },
  { id: 'CE3B', name: 'CE 3rd Year Sec B', department: 'Civil', semester: 5, section: 'B', studentCount: 50, 
    subjects: ['CE301', 'CE302', 'CE203', 'CE203L', 'CE204', 'MG101'] },
  { id: 'CE4A', name: 'CE 4th Year Sec A', department: 'Civil', semester: 7, section: 'A', studentCount: 48, 
    subjects: ['CE303', 'CE304', 'CE401', 'CE402', 'MG201'] },
  { id: 'CE4B', name: 'CE 4th Year Sec B', department: 'Civil', semester: 7, section: 'B', studentCount: 45, 
    subjects: ['CE303', 'CE304', 'CE401', 'CE402', 'MG201'] },

  // Additional CS Sections for higher semesters
  { id: 'CS2C', name: 'CS 2nd Year Sec C', department: 'Computer Science', semester: 3, section: 'C', studentCount: 55, 
    subjects: ['CS201', 'CS201L', 'CS202', 'CS202L', 'CS103', 'MA201', 'MA301'] },
  { id: 'CS3C', name: 'CS 3rd Year Sec C', department: 'Computer Science', semester: 5, section: 'C', studentCount: 50, 
    subjects: ['CS301', 'CS302', 'CS303', 'CS203', 'CS203L', 'MG101'] },

  // Additional EC Sections
  { id: 'EC2C', name: 'EC 2nd Year Sec C', department: 'Electronics', semester: 3, section: 'C', studentCount: 50, 
    subjects: ['EC201', 'EC201L', 'EC202', 'EC202L', 'EC103', 'MA201', 'MA301'] },

  // Additional ME Sections
  { id: 'ME2C', name: 'ME 2nd Year Sec C', department: 'Mechanical', semester: 3, section: 'C', studentCount: 60, 
    subjects: ['ME201', 'ME201L', 'ME202', 'ME202L', 'ME103', 'MA201', 'MA301'] },
  { id: 'ME3C', name: 'ME 3rd Year Sec C', department: 'Mechanical', semester: 5, section: 'C', studentCount: 55, 
    subjects: ['ME301', 'ME302', 'ME203', 'ME203L', 'ME204', 'MG101'] },
];

// ============================================
// DATA LOADING FUNCTION
// ============================================
async function loadTestData() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🎓 SMART UNIVERSITY RESOURCE SCHEDULING SYSTEM - DATA LOADER');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('📊 Data Summary:');
  console.log(`   • Faculty Members: ${sampleFaculty.length}`);
  console.log(`   • Rooms & Labs: ${sampleRooms.length}`);
  console.log(`   • Subjects: ${sampleSubjects.length}`);
  console.log(`   • Classes: ${sampleClasses.length}`);
  console.log('');

  try {
    // Clear existing data first
    console.log('🗑️  Clearing existing data...');
    try {
      await axios.delete(`${API_URL}/timetable/all`);
      await axios.delete(`${API_URL}/classes/all`);
      await axios.delete(`${API_URL}/subjects/all`);
      await axios.delete(`${API_URL}/rooms/all`);
      await axios.delete(`${API_URL}/faculty/all`);
      console.log('   ✅ Existing data cleared\n');
    } catch (e) {
      console.log('   ⚠️  Could not clear existing data (may not exist)\n');
    }

    // Load Faculty
    console.log('👨‍🏫 Loading faculty members...');
    let facultyCount = 0;
    for (const faculty of sampleFaculty) {
      try {
        await axios.post(`${API_URL}/faculty`, faculty);
        facultyCount++;
      } catch (e) {
        // Try bulk if single fails
      }
    }
    if (facultyCount === 0) {
      const facultyRes = await axios.post(`${API_URL}/faculty/bulk`, { faculty: sampleFaculty });
      facultyCount = facultyRes.data.data?.length || 0;
    }
    console.log(`   ✅ ${facultyCount} faculty members created\n`);

    // Load Rooms
    console.log('🏫 Loading rooms and labs...');
    let roomCount = 0;
    for (const room of sampleRooms) {
      try {
        await axios.post(`${API_URL}/rooms`, room);
        roomCount++;
      } catch (e) {
        // Try bulk if single fails
      }
    }
    if (roomCount === 0) {
      const roomsRes = await axios.post(`${API_URL}/rooms/bulk`, { rooms: sampleRooms });
      roomCount = roomsRes.data.data?.length || 0;
    }
    console.log(`   ✅ ${roomCount} rooms created\n`);

    // Load Subjects
    console.log('📚 Loading subjects...');
    let subjectCount = 0;
    for (const subject of sampleSubjects) {
      try {
        await axios.post(`${API_URL}/subjects`, subject);
        subjectCount++;
      } catch (e) {
        // Try bulk if single fails
      }
    }
    if (subjectCount === 0) {
      const subjectsRes = await axios.post(`${API_URL}/subjects/bulk`, { subjects: sampleSubjects });
      subjectCount = subjectsRes.data.data?.length || 0;
    }
    console.log(`   ✅ ${subjectCount} subjects created\n`);

    // Load Classes
    console.log('👥 Loading classes...');
    let classCount = 0;
    for (const cls of sampleClasses) {
      try {
        await axios.post(`${API_URL}/classes`, cls);
        classCount++;
      } catch (e) {
        // Try bulk if single fails
      }
    }
    if (classCount === 0) {
      const classesRes = await axios.post(`${API_URL}/classes/bulk`, { classes: sampleClasses });
      classCount = classesRes.data.data?.length || 0;
    }
    console.log(`   ✅ ${classCount} classes created\n`);

    // Generate Timetable
    console.log('📅 Generating timetable using backtracking algorithm...');
    console.log('   ⏳ This may take a moment for large datasets...\n');
    
    const startTime = Date.now();
    const timetableRes = await axios.post(`${API_URL}/generate-timetable`);
    const endTime = Date.now();
    
    if (timetableRes.data.success) {
      console.log('   ═══════════════════════════════════════════════════');
      console.log('   ✅ TIMETABLE GENERATED SUCCESSFULLY!');
      console.log('   ═══════════════════════════════════════════════════');
      console.log(`   ⏱️  Generation time: ${timetableRes.data.data.metadata?.generationTime || (endTime - startTime)}ms`);
      console.log(`   📊 Total schedule entries: ${timetableRes.data.data.timetable?.schedule?.length || 'N/A'}`);
      console.log(`   📋 Classes scheduled: ${timetableRes.data.data.byClass?.length || 'N/A'}`);
      console.log(`   👨‍🏫 Faculty schedules: ${timetableRes.data.data.byFaculty?.length || 'N/A'}`);
    } else {
      console.log(`   ❌ Generation failed: ${timetableRes.data.message}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✨ DATA LOADING COMPLETE!');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('🌐 Open http://localhost:3000 to view the timetable');
    console.log('📥 Use the "Download PDF" button to export timetables');
    console.log('═══════════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Error loading test data:', error.response?.data?.message || error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the backend server is running on http://localhost:5000');
    }
    console.error('   Full error:', error.message);
  }
}

// ============================================
// QUICK STATS FUNCTION
// ============================================
function printStats() {
  console.log('\n📊 DATA STATISTICS:');
  console.log('═══════════════════════════════════════════════════════════════');
  
  // Faculty by department
  const facultyByDept = {};
  sampleFaculty.forEach(f => {
    facultyByDept[f.department] = (facultyByDept[f.department] || 0) + 1;
  });
  console.log('\n👨‍🏫 Faculty by Department:');
  Object.entries(facultyByDept).forEach(([dept, count]) => {
    console.log(`   ${dept}: ${count}`);
  });

  // Rooms by type
  const roomsByType = {};
  sampleRooms.forEach(r => {
    roomsByType[r.type] = (roomsByType[r.type] || 0) + 1;
  });
  console.log('\n🏫 Rooms by Type:');
  Object.entries(roomsByType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  // Subjects by department
  const subjectsByDept = {};
  sampleSubjects.forEach(s => {
    subjectsByDept[s.department] = (subjectsByDept[s.department] || 0) + 1;
  });
  console.log('\n📚 Subjects by Department:');
  Object.entries(subjectsByDept).forEach(([dept, count]) => {
    console.log(`   ${dept}: ${count}`);
  });

  // Classes by department
  const classesByDept = {};
  sampleClasses.forEach(c => {
    classesByDept[c.department] = (classesByDept[c.department] || 0) + 1;
  });
  console.log('\n👥 Classes by Department:');
  Object.entries(classesByDept).forEach(([dept, count]) => {
    console.log(`   ${dept}: ${count}`);
  });

  // Total students
  const totalStudents = sampleClasses.reduce((sum, c) => sum + c.studentCount, 0);
  console.log(`\n🎓 Total Students: ${totalStudents}`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
if (require.main === module) {
  printStats();
  loadTestData();
}

module.exports = { 
  sampleFaculty, 
  sampleRooms, 
  sampleSubjects, 
  sampleClasses,
  loadTestData,
  printStats
};
