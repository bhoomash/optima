import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { facultyApi, roomsApi, subjectsApi, classesApi, timetableApi } from '../services/api';

/**
 * Admin Dashboard Component
 * Main overview page showing statistics and quick actions
 */
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
          text: `✅ Timetable generated successfully! Generated in ${response.data.data.metadata.generationTime}ms`
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

  // Load sample data for testing
  const handleLoadSampleData = async () => {
    try {
      setLoading(true);
      setMessage(null);

      // Sample Faculty Data
      const sampleFaculty = [
        { id: 'FAC001', name: 'Dr. John Smith', department: 'Computer Science', subjectsCanTeach: ['SUB001', 'SUB002'], availabilitySlots: [] },
        { id: 'FAC002', name: 'Prof. Sarah Johnson', department: 'Computer Science', subjectsCanTeach: ['SUB003', 'SUB004'], availabilitySlots: [] },
        { id: 'FAC003', name: 'Dr. Michael Brown', department: 'Computer Science', subjectsCanTeach: ['SUB001', 'SUB005'], availabilitySlots: [] },
        { id: 'FAC004', name: 'Dr. Emily Davis', department: 'Computer Science', subjectsCanTeach: ['SUB002', 'SUB006'], availabilitySlots: [] },
        { id: 'FAC005', name: 'Prof. Robert Wilson', department: 'Computer Science', subjectsCanTeach: ['SUB003', 'SUB004', 'SUB005'], availabilitySlots: [] }
      ];

      // Sample Rooms Data
      const sampleRooms = [
        { roomId: 'CR101', name: 'Classroom 101', type: 'classroom', capacity: 60, building: 'Main' },
        { roomId: 'CR102', name: 'Classroom 102', type: 'classroom', capacity: 60, building: 'Main' },
        { roomId: 'CR103', name: 'Classroom 103', type: 'classroom', capacity: 40, building: 'Main' },
        { roomId: 'LAB01', name: 'Computer Lab 1', type: 'lab', capacity: 30, building: 'Tech' },
        { roomId: 'LAB02', name: 'Computer Lab 2', type: 'lab', capacity: 30, building: 'Tech' }
      ];

      // Sample Subjects Data
      const sampleSubjects = [
        { id: 'SUB001', name: 'Data Structures', code: 'CS201', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 3 },
        { id: 'SUB002', name: 'Database Systems', code: 'CS301', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 3 },
        { id: 'SUB003', name: 'Operating Systems', code: 'CS302', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 3 },
        { id: 'SUB004', name: 'Computer Networks', code: 'CS303', department: 'Computer Science', weeklyHours: 3, isLab: false, semester: 3 },
        { id: 'SUB005', name: 'Programming Lab', code: 'CS201L', department: 'Computer Science', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 3 },
        { id: 'SUB006', name: 'Database Lab', code: 'CS301L', department: 'Computer Science', weeklyHours: 2, isLab: true, labHoursPerSession: 2, semester: 3 }
      ];

      // Sample Classes Data
      const sampleClasses = [
        { id: 'CLS001', name: 'CS 3rd Sem A', department: 'Computer Science', semester: 3, section: 'A', studentCount: 50, subjects: ['SUB001', 'SUB002', 'SUB003', 'SUB004', 'SUB005', 'SUB006'] },
        { id: 'CLS002', name: 'CS 3rd Sem B', department: 'Computer Science', semester: 3, section: 'B', studentCount: 45, subjects: ['SUB001', 'SUB002', 'SUB003', 'SUB004', 'SUB005', 'SUB006'] }
      ];

      // Load all sample data
      await Promise.all([
        facultyApi.bulkCreate(sampleFaculty).catch(e => console.log('Faculty might already exist')),
        roomsApi.bulkCreate(sampleRooms).catch(e => console.log('Rooms might already exist')),
        subjectsApi.bulkCreate(sampleSubjects).catch(e => console.log('Subjects might already exist')),
        classesApi.bulkCreate(sampleClasses).catch(e => console.log('Classes might already exist'))
      ]);

      setMessage({
        type: 'success',
        text: '✅ Sample data loaded successfully! You can now generate a timetable.'
      });

      // Refresh stats
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

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem' }}>Dashboard</h2>

      {/* Message Alert */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon faculty">👨‍🏫</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.faculty}</h3>
            <p>Faculty Members</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon room">🏫</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.rooms}</h3>
            <p>Rooms</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon subject">📖</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.subjects}</h3>
            <p>Subjects</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon class">👥</div>
          <div className="stat-info">
            <h3>{loading ? '...' : stats.classes}</h3>
            <p>Classes</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleGenerateTimetable}
            disabled={generating || stats.faculty === 0 || stats.rooms === 0 || stats.subjects === 0 || stats.classes === 0}
          >
            {generating ? (
              <>
                <span className="spinner" style={{ width: '20px', height: '20px' }}></span>
                Generating...
              </>
            ) : (
              <>📅 Generate Timetable</>
            )}
          </button>
          
          <button 
            className="btn btn-secondary btn-lg"
            onClick={handleLoadSampleData}
            disabled={loading}
          >
            📥 Load Sample Data
          </button>

          {timetable && (
            <Link to="/timetable" className="btn btn-success btn-lg">
              👁️ View Current Timetable
            </Link>
          )}
        </div>

        {stats.faculty === 0 && (
          <p style={{ marginTop: '1rem', color: '#666' }}>
            ⚠️ Add faculty, rooms, subjects, and classes before generating a timetable, or use "Load Sample Data" to get started quickly.
          </p>
        )}
      </div>

      {/* Current Timetable Info */}
      {timetable && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Current Timetable</h3>
            <span className="badge badge-success">Active</span>
          </div>
          <p><strong>Name:</strong> {timetable.name}</p>
          <p><strong>Generated:</strong> {new Date(timetable.generatedAt).toLocaleString()}</p>
          <p><strong>Schedule Entries:</strong> {timetable.schedule?.length || 0}</p>
          {timetable.metadata && (
            <p><strong>Generation Time:</strong> {timetable.metadata.generationTime}ms</p>
          )}
        </div>
      )}

      {/* Quick Links */}
      <div className="grid grid-4">
        <Link to="/faculty" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👨‍🏫</div>
          <h4>Manage Faculty</h4>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Add and manage faculty members</p>
        </Link>
        <Link to="/rooms" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏫</div>
          <h4>Manage Rooms</h4>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Add classrooms and labs</p>
        </Link>
        <Link to="/subjects" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📖</div>
          <h4>Manage Subjects</h4>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Add and configure subjects</p>
        </Link>
        <Link to="/classes" className="card" style={{ textDecoration: 'none', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
          <h4>Manage Classes</h4>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Add student classes</p>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;
