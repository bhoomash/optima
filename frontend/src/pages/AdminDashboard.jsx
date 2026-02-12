import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  HiOutlineUsers, 
  HiOutlineOfficeBuilding, 
  HiOutlineBookOpen, 
  HiOutlineUserGroup, 
  HiOutlineCalendar, 
  HiOutlineDownload, 
  HiOutlineEye, 
  HiOutlineExclamation, 
  HiOutlineCheckCircle,
  HiOutlineArrowUp,
  HiOutlineArrowDown,
  HiOutlineDotsHorizontal,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineClock,
  HiOutlineAcademicCap
} from 'react-icons/hi';
import { facultyApi, roomsApi, subjectsApi, classesApi, timetableApi } from '../services/api';


function AdminDashboard() {
  const [stats, setStats] = useState({
    faculty: 0,
    rooms: 0,
    subjects: 0,
    classes: 0
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [currentDate] = useState(new Date());

  // Fetch all statistics
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const [facultyRes, roomsRes, subjectsRes, classesRes, timetableRes] = await Promise.all([
        facultyApi.getAll(),
        roomsApi.getAll(),
        subjectsApi.getAll(),
        classesApi.getAll(),
        timetableApi.getActive().catch(() => ({ data: { data: null } }))
      ]);

      setStats({
        faculty: facultyRes.data.count || 0,
        rooms: roomsRes.data.count || 0,
        subjects: subjectsRes.data.count || 0,
        classes: classesRes.data.count || 0
      });

      if (timetableRes.data.data?.timetable) {
        setTimetable(timetableRes.data.data.timetable);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Generate timetable
  const handleGenerateTimetable = async () => {
    try {
      setGenerating(true);
      setMessage(null);
      
      const response = await timetableApi.generate();
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `Timetable generated successfully! Generated in ${response.data.data.metadata.generationTime}ms`
        });
        setTimetable(response.data.data.timetable);
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Failed to generate timetable'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error generating timetable. Please ensure all data is properly configured.'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleLoadSampleData = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const sampleFaculty = [
        { id: 'FAC001', name: 'Dr. John Smith', department: 'Computer Science', subjectsCanTeach: ['SUB001', 'SUB002'], availabilitySlots: [] },
        { id: 'FAC002', name: 'Prof. Sarah Johnson', department: 'Computer Science', subjectsCanTeach: ['SUB003', 'SUB004'], availabilitySlots: [] },
        { id: 'FAC003', name: 'Dr. Michael Brown', department: 'Computer Science', subjectsCanTeach: ['SUB001', 'SUB005'], availabilitySlots: [] },
        { id: 'FAC004', name: 'Dr. Emily Davis', department: 'Computer Science', subjectsCanTeach: ['SUB002', 'SUB006'], availabilitySlots: [] },
        { id: 'FAC005', name: 'Prof. Robert Wilson', department: 'Computer Science', subjectsCanTeach: ['SUB003', 'SUB004', 'SUB005'], availabilitySlots: [] }
      ];

      const sampleRooms = [
        { roomId: 'CR101', name: 'Classroom 101', type: 'classroom', capacity: 60, building: 'Main' },
        { roomId: 'CR102', name: 'Classroom 102', type: 'classroom', capacity: 60, building: 'Main' },
        { roomId: 'CR103', name: 'Classroom 103', type: 'classroom', capacity: 40, building: 'Main' },
        { roomId: 'LAB01', name: 'Computer Lab 1', type: 'lab', capacity: 30, building: 'Tech' },
        { roomId: 'LAB02', name: 'Computer Lab 2', type: 'lab', capacity: 30, building: 'Tech' }
      ];

      const sampleSubjects = [
        { id: 'SUB001', name: 'Data Structures', code: 'CS201', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 3 },
        { id: 'SUB002', name: 'Database Systems', code: 'CS301', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 3 },
        { id: 'SUB003', name: 'Operating Systems', code: 'CS302', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 3 },
        { id: 'SUB004', name: 'Computer Networks', code: 'CS303', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 3 },
        { id: 'SUB005', name: 'Programming Lab', code: 'CS201L', department: 'Computer Science', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 3 },
        { id: 'SUB006', name: 'Database Lab', code: 'CS301L', department: 'Computer Science', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 3 }
      ];

      const sampleClasses = [
        { id: 'CLS001', name: 'CS 3rd Sem A', department: 'Computer Science', semester: 3, section: 'A', studentCount: 50, subjects: ['SUB001', 'SUB002', 'SUB003', 'SUB004', 'SUB005', 'SUB006'] },
        { id: 'CLS002', name: 'CS 3rd Sem B', department: 'Computer Science', semester: 3, section: 'B', studentCount: 45, subjects: ['SUB001', 'SUB002', 'SUB003', 'SUB004', 'SUB005', 'SUB006'] }
      ];

      await Promise.all([
        facultyApi.bulkCreate(sampleFaculty).catch(e => console.log('Faculty might already exist')),
        roomsApi.bulkCreate(sampleRooms).catch(e => console.log('Rooms might already exist')),
        subjectsApi.bulkCreate(sampleSubjects).catch(e => console.log('Subjects might already exist')),
        classesApi.bulkCreate(sampleClasses).catch(e => console.log('Classes might already exist'))
      ]);

      setMessage({
        type: 'success',
        text: 'Sample data loaded successfully! You can now generate a timetable.'
      });

      await fetchStats();
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Error loading sample data. Some data may already exist.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const getWeekDays = () => {
    const days = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const weekDays = getWeekDays();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Agenda items (mock data based on timetable)
  const agendaItems = [
    { time: '08:00 am', label: 'All Classes', title: 'Morning Lectures Begin' },
    { time: '10:00 am', label: 'Sem 3-5', title: 'Lab Sessions' },
    { time: '12:00 pm', label: 'All', title: 'Lunch Break' },
    { time: '02:00 pm', label: 'Sem 5-7', title: 'Afternoon Sessions' }
  ];

  return (
    <div className="admin-dashboard">
      {/* Message Alert */}
      {message && (
        <div className={`dashboard-alert ${message.type}`}>
          {message.type === 'success' ? <HiOutlineCheckCircle /> : <HiOutlineExclamation />}
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="alert-close">&times;</button>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Main Content Area */}
        <div className="dashboard-main-area">
          {/* Statistics Cards */}
          <div className="stats-row">
            <div className="stat-card-modern faculty-card">
              <div className="stat-card-header">
                <span className="stat-badge up">
                  <HiOutlineArrowUp /> {stats.faculty > 0 ? '15%' : '0%'}
                </span>
                <button className="stat-menu"><HiOutlineDotsHorizontal /></button>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-value">{loading ? '...' : stats.faculty.toLocaleString()}</h2>
                <p className="stat-label">Faculty</p>
              </div>
              <div className="stat-card-icon">
                <HiOutlineUsers />
              </div>
            </div>

            <div className="stat-card-modern rooms-card">
              <div className="stat-card-header">
                <span className="stat-badge down">
                  <HiOutlineArrowDown /> {stats.rooms > 0 ? '3%' : '0%'}
                </span>
                <button className="stat-menu"><HiOutlineDotsHorizontal /></button>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-value">{loading ? '...' : stats.rooms.toLocaleString()}</h2>
                <p className="stat-label">Rooms</p>
              </div>
              <div className="stat-card-icon">
                <HiOutlineOfficeBuilding />
              </div>
            </div>

            <div className="stat-card-modern subjects-card">
              <div className="stat-card-header">
                <span className="stat-badge down">
                  <HiOutlineArrowDown /> {stats.subjects > 0 ? '5%' : '0%'}
                </span>
                <button className="stat-menu"><HiOutlineDotsHorizontal /></button>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-value">{loading ? '...' : stats.subjects.toLocaleString()}</h2>
                <p className="stat-label">Subjects</p>
              </div>
              <div className="stat-card-icon">
                <HiOutlineBookOpen />
              </div>
            </div>

            <div className="stat-card-modern classes-card">
              <div className="stat-card-header">
                <span className="stat-badge up">
                  <HiOutlineArrowUp /> {stats.classes > 0 ? '8%' : '0%'}
                </span>
                <button className="stat-menu"><HiOutlineDotsHorizontal /></button>
              </div>
              <div className="stat-card-body">
                <h2 className="stat-value">{loading ? '...' : stats.classes.toLocaleString()}</h2>
                <p className="stat-label">Classes</p>
              </div>
              <div className="stat-card-icon">
                <HiOutlineUserGroup />
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="charts-row">
            {/* Resource Distribution */}
            <div className="chart-card">
              <div className="chart-header">
                <h3>Resource Distribution</h3>
                <button className="stat-menu"><HiOutlineDotsHorizontal /></button>
              </div>
              <div className="chart-body">
                <div className="donut-chart">
                  <svg viewBox="0 0 100 100" className="donut-svg">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f5f0eb" strokeWidth="12" />
                    <circle 
                      cx="50" cy="50" r="40" fill="none" 
                      stroke="#c9a87c" strokeWidth="12"
                      strokeDasharray={`${(stats.faculty / (stats.faculty + stats.rooms + stats.subjects + stats.classes || 1)) * 251.2} 251.2`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                    <circle 
                      cx="50" cy="50" r="40" fill="none" 
                      stroke="#8b7355" strokeWidth="12"
                      strokeDasharray={`${(stats.rooms / (stats.faculty + stats.rooms + stats.subjects + stats.classes || 1)) * 251.2} 251.2`}
                      strokeDashoffset={`${-(stats.faculty / (stats.faculty + stats.rooms + stats.subjects + stats.classes || 1)) * 251.2}`}
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  <div className="donut-center">
                    <span className="donut-total">{stats.faculty + stats.rooms + stats.subjects + stats.classes}</span>
                    <span className="donut-label">Total</span>
                  </div>
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-dot faculty"></span>
                    <span className="legend-label">Faculty ({stats.faculty})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot rooms"></span>
                    <span className="legend-label">Rooms ({stats.rooms})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot subjects"></span>
                    <span className="legend-label">Subjects ({stats.subjects})</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-dot classes"></span>
                    <span className="legend-label">Classes ({stats.classes})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="chart-card actions-card">
              <div className="chart-header">
                <h3>Quick Actions</h3>
                <div className="action-filters">
                  <select className="filter-select">
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
              </div>
              <div className="chart-body actions-body">
                <button 
                  className="action-btn primary"
                  onClick={handleGenerateTimetable}
                  disabled={generating || stats.faculty === 0 || stats.rooms === 0 || stats.subjects === 0 || stats.classes === 0}
                >
                  {generating ? (
                    <>
                      <span className="lds-spinner lds-spinner-sm"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <HiOutlineCalendar />
                      Generate Timetable
                    </>
                  )}
                </button>
                
                <button 
                  className="action-btn secondary"
                  onClick={handleLoadSampleData}
                  disabled={loading}
                >
                  <HiOutlineDownload />
                  Load Sample Data
                </button>

                {timetable && (
                  <Link to="/timetable" className="action-btn success">
                    <HiOutlineEye />
                    View Current Timetable
                  </Link>
                )}

                {stats.faculty === 0 && (
                  <div className="action-hint">
                    <HiOutlineExclamation />
                    <span>Add data before generating timetable, or use "Load Sample Data" to start quickly.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Current Timetable Info */}
          {timetable && (
            <div className="timetable-info-card">
              <div className="timetable-info-header">
                <div className="timetable-info-title">
                  <HiOutlineCalendar />
                  <h3>Current Timetable</h3>
                </div>
                <span className="status-badge active">Active</span>
              </div>
              <div className="timetable-info-body">
                <div className="info-item">
                  <span className="info-label">Name</span>
                  <span className="info-value">{timetable.name}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Generated</span>
                  <span className="info-value">{new Date(timetable.generatedAt).toLocaleString()}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Entries</span>
                  <span className="info-value">{timetable.schedule?.length || 0}</span>
                </div>
                {timetable.metadata && (
                  <div className="info-item">
                    <span className="info-label">Gen. Time</span>
                    <span className="info-value">{timetable.metadata.generationTime}ms</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="dashboard-sidebar">
          {/* Calendar Widget */}
          <div className="sidebar-card calendar-card">
            <div className="calendar-header">
              <button className="calendar-nav"><HiOutlineChevronLeft /></button>
              <h3>{formatMonth(currentDate)}</h3>
              <button className="calendar-nav"><HiOutlineChevronRight /></button>
            </div>
            <div className="calendar-days">
              {dayNames.map(day => (
                <span key={day} className="day-name">{day}</span>
              ))}
            </div>
            <div className="calendar-dates">
              {weekDays.map((day, idx) => (
                <span 
                  key={idx} 
                  className={`date-item ${day.toDateString() === currentDate.toDateString() ? 'today' : ''}`}
                >
                  {day.getDate()}
                </span>
              ))}
            </div>
          </div>

          {/* Agenda */}
          <div className="sidebar-card agenda-card">
            <div className="agenda-header">
              <h3>Agenda</h3>
              <button className="stat-menu"><HiOutlineDotsHorizontal /></button>
            </div>
            <div className="agenda-list">
              {agendaItems.map((item, idx) => (
                <div key={idx} className="agenda-item">
                  <div className="agenda-time">
                    <HiOutlineClock />
                    {item.time}
                  </div>
                  <div className="agenda-content">
                    <span className="agenda-label">{item.label}</span>
                    <span className="agenda-title">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="sidebar-card quick-links-card">
            <h3>Quick Links</h3>
            <div className="quick-links-list">
              <Link to="/faculty" className="quick-link">
                <div className="quick-link-icon faculty">
                  <HiOutlineUsers />
                </div>
                <span>Manage Faculty</span>
              </Link>
              <Link to="/rooms" className="quick-link">
                <div className="quick-link-icon rooms">
                  <HiOutlineOfficeBuilding />
                </div>
                <span>Manage Rooms</span>
              </Link>
              <Link to="/subjects" className="quick-link">
                <div className="quick-link-icon subjects">
                  <HiOutlineBookOpen />
                </div>
                <span>Manage Subjects</span>
              </Link>
              <Link to="/classes" className="quick-link">
                <div className="quick-link-icon classes">
                  <HiOutlineAcademicCap />
                </div>
                <span>Manage Classes</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
