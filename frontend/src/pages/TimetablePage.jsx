import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { HiOutlineDownload, HiOutlineRefresh, HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineExclamationCircle, HiOutlineUsers, HiOutlineUserGroup } from 'react-icons/hi';
import { timetableApi, classesApi, facultyApi } from '../services/api';
import TimetableView from '../components/TimetableView';
import { useAuth } from '../contexts/AuthContext';

/**
 * Timetable Page
 * Displays generated timetable and provides generation controls
 * Supports both Class and Faculty views
 */
function TimetablePage() {
  const [timetableData, setTimetableData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [facultySchedule, setFacultySchedule] = useState(null);
  const [viewMode, setViewMode] = useState('class'); // 'class' or 'faculty'
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  
  // Check if user is admin (for showing generate button)
  const { isAdmin, isAuthenticated } = useAuth();
  const canGenerate = isAuthenticated && isAdmin();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const periodTimes = [
    '9:00-9:50', '10:00-10:50', '11:00-11:50', '12:00-12:50',
    '1:00-1:50', '2:00-2:50', '3:00-3:50', '4:00-4:50'
  ];

  // Fetch timetable and classes
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [timetableRes, classesRes, facultyRes] = await Promise.all([
        timetableApi.getActive().catch(() => ({ data: { data: null } })),
        classesApi.getAll(),
        facultyApi.getAll()
      ]);

      if (timetableRes.data.data) {
        setTimetableData(timetableRes.data.data);
      }
      setClasses(classesRes.data.data || []);
      setFaculty(facultyRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch faculty schedule when faculty is selected
  const fetchFacultySchedule = useCallback(async (facultyId) => {
    if (!facultyId) {
      setFacultySchedule(null);
      return;
    }
    try {
      setLoading(true);
      const response = await timetableApi.getFacultySchedule(facultyId);
      if (response.data.success) {
        setFacultySchedule(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching faculty schedule:', error);
      setFacultySchedule(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch faculty schedule when selected faculty changes
  useEffect(() => {
    if (viewMode === 'faculty' && selectedFaculty) {
      fetchFacultySchedule(selectedFaculty);
    }
  }, [viewMode, selectedFaculty, fetchFacultySchedule]);

  // Generate new timetable
  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setMessage(null);
      
      const response = await timetableApi.generate();
      
      if (response.data.success) {
        setMessage({
          type: 'success',
          text: `✅ Timetable generated successfully in ${response.data.data.metadata.generationTime}ms!`
        });
        setTimetableData(response.data.data);
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || 'Failed to generate timetable'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Error generating timetable. Please check your data configuration.'
      });
    } finally {
      setGenerating(false);
    }
  };

  // Build grid data for a single entity (class or faculty)
  const buildGrid = (schedule) => {
    const grid = {};
    days.forEach(day => {
      grid[day] = {};
      periods.forEach(period => {
        grid[day][period] = null;
      });
    });
    schedule.forEach(entry => {
      if (grid[entry.day] && grid[entry.day][entry.period] === null) {
        grid[entry.day][entry.period] = entry;
      }
    });
    return grid;
  };

  // Download timetable as PDF
  const handleDownloadPDF = () => {
    const dataToDownload = viewMode === 'faculty' ? getFacultyFilteredData() : filteredData;
    
    if (!dataToDownload || dataToDownload.length === 0) {
      setMessage({ type: 'error', text: 'No timetable data to download' });
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    dataToDownload.forEach((entity, index) => {
      if (index > 0) {
        doc.addPage();
      }

      const title = viewMode === 'faculty' 
        ? `Faculty Timetable: ${entity.facultyName || entity.facultyId}`
        : `Timetable: ${entity.className || entity.classId}`;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55);
      doc.text(title, pageWidth / 2, 15, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(`Generated: ${new Date().toLocaleDateString()} | ${entity.schedule.length} classes/week`, pageWidth / 2, 22, { align: 'center' });

      // Build table data
      const grid = buildGrid(entity.schedule);
      const tableHeaders = ['Day', ...periods.map((p, i) => `P${p}\n${periodTimes[i]}`)];
      
      const tableBody = days.map(day => {
        const row = [day];
        periods.forEach(period => {
          const cell = grid[day][period];
          if (cell) {
            const cellText = viewMode === 'faculty'
              ? `${cell.subjectName}${cell.isLab ? ' (Lab)' : ''}\n${cell.className}\n${cell.roomName}`
              : `${cell.subjectName}${cell.isLab ? ' (Lab)' : ''}\n${cell.facultyName}\n${cell.roomName}`;
            row.push(cellText);
          } else {
            row.push('-');
          }
        });
        return row;
      });

      // Generate table
      doc.autoTable({
        head: [tableHeaders],
        body: tableBody,
        startY: 28,
        theme: 'grid',
        styles: {
          fontSize: 7,
          cellPadding: 2,
          valign: 'middle',
          halign: 'center',
          lineColor: [229, 231, 235],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: [55, 65, 81],
          fontStyle: 'bold',
          fontSize: 7,
        },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [249, 250, 251], halign: 'left' }
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255]
        },
        didParseCell: function(data) {
          // Highlight lab sessions
          if (data.section === 'body' && data.column.index > 0) {
            const cellText = data.cell.raw;
            if (cellText && cellText.includes('(Lab)')) {
              data.cell.styles.fillColor = [254, 247, 224];
            }
          }
        }
      });

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text('Optima - University Resource Scheduling System', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    });

    // Save the PDF
    let fileName;
    if (viewMode === 'faculty') {
      fileName = selectedFaculty ? `faculty-${selectedFaculty}-timetable.pdf` : 'faculty-timetable.pdf';
    } else {
      fileName = selectedClass === 'all' ? 'all-classes-timetable.pdf' : `class-${selectedClass}-timetable.pdf`;
    }
    
    doc.save(fileName);
    setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
  };

  // Get faculty filtered data for display
  const getFacultyFilteredData = () => {
    if (!facultySchedule) return [];
    
    const selectedFac = faculty.find(f => f.id === selectedFaculty);
    return [{
      facultyId: selectedFaculty,
      facultyName: selectedFac?.name || selectedFaculty,
      department: selectedFac?.department,
      schedule: facultySchedule.schedule || []
    }];
  };

  // Filter schedule by selected class
  const getFilteredData = () => {
    if (!timetableData) return null;

    if (selectedClass === 'all') {
      return timetableData.byClass;
    }
    return timetableData.byClass?.filter(c => c.classId === selectedClass) || [];
  };

  const filteredData = getFilteredData();

  // Styles for responsive design
  const styles = {
    headerContainer: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: '1.5rem', 
      flexWrap: 'wrap', 
      gap: '1rem'
    },
    buttonsContainer: {
      display: 'flex', 
      gap: '0.75rem',
      flexWrap: 'wrap'
    },
    infoCard: {
      marginBottom: '1.5rem'
    },
    infoCardInner: {
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start', 
      flexWrap: 'wrap', 
      gap: '1rem'
    },
    filterContainer: {
      display: 'flex', 
      gap: '1rem', 
      alignItems: 'center', 
      flexWrap: 'wrap',
      width: '100%',
      maxWidth: '300px'
    }
  };

  return (
    <div>
      <div style={styles.headerContainer}>
        <h2 style={{ margin: 0 }}>Timetable</h2>
        <div style={styles.buttonsContainer}>
          {timetableData && (
            <button 
              className="btn btn-secondary btn-responsive"
              onClick={handleDownloadPDF}
              title="Download as PDF"
            >
              <HiOutlineDownload /> <span className="btn-text">Download PDF</span>
            </button>
          )}
          {canGenerate && (
            <button 
              className="btn btn-primary btn-responsive"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  <span className="btn-text">Generating...</span>
                </>
              ) : (
                <><HiOutlineRefresh /> <span className="btn-text">Generate New</span></>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? <HiOutlineCheckCircle /> : <HiOutlineExclamationCircle />}
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {loading ? (
        <div className="card">
          <div className="loading-container">
            <div className="spinner"><span></span><span></span><span></span><span></span></div>
            <p>Loading timetable...</p>
          </div>
        </div>
      ) : !timetableData ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineCalendar /></div>
            <h3>No Timetable Generated</h3>
            <p>{canGenerate ? 'Click "Generate New Timetable" to create a schedule' : 'No schedule has been created yet. Please check back later.'}</p>
            {canGenerate && (
              <button 
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={generating}
                style={{ marginTop: '1rem' }}
              >
                Generate Timetable
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Timetable Info */}
          <div className="card" style={styles.infoCard}>
            <div style={styles.infoCardInner}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 0.25rem 0' }}>{timetableData.timetable?.name || 'Current Timetable'}</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
                  Generated: {new Date(timetableData.timetable?.generatedAt).toLocaleString()}
                  <br />
                  Entries: {timetableData.timetable?.schedule?.length || 0}
                </p>
              </div>
              
              {/* View Mode Toggle & Filters */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* View Mode Toggle - Only show for admin */}
                {canGenerate && (
                  <div style={{ display: 'flex', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <button
                      onClick={() => setViewMode('class')}
                      style={{
                        padding: '0.5rem 1rem',
                        border: 'none',
                        background: viewMode === 'class' ? '#b8860b' : '#f8fafc',
                        color: viewMode === 'class' ? 'white' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      <HiOutlineUserGroup /> Classes
                    </button>
                    <button
                      onClick={() => setViewMode('faculty')}
                      style={{
                        padding: '0.5rem 1rem',
                        border: 'none',
                        background: viewMode === 'faculty' ? '#b8860b' : '#f8fafc',
                        color: viewMode === 'faculty' ? 'white' : '#64748b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      <HiOutlineUsers /> Faculty
                    </button>
                  </div>
                )}

                {/* Filter Dropdown - Class filter for non-admin, both for admin */}
                <div style={styles.filterContainer}>
                  {(!canGenerate || viewMode === 'class') ? (
                    <select 
                      className="form-select"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="all">All Classes</option>
                      {classes.map((cls) => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select 
                      className="form-select"
                      value={selectedFaculty}
                      onChange={(e) => setSelectedFaculty(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="">Select Faculty</option>
                      {faculty.map((fac) => (
                        <option key={fac.id} value={fac.id}>
                          {fac.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timetable View - Class view only for non-admin, both views for admin */}
          {(!canGenerate || viewMode === 'class') ? (
            filteredData && filteredData.length > 0 ? (
              <TimetableView 
                data={filteredData} 
                viewMode="class"
              />
            ) : (
              <div className="card">
                <div className="empty-state">
                  <p>No schedule data for selected filter</p>
                </div>
              </div>
            )
          ) : (
            selectedFaculty ? (
              facultySchedule && facultySchedule.schedule?.length > 0 ? (
                <TimetableView 
                  data={getFacultyFilteredData()} 
                  viewMode="faculty"
                />
              ) : (
                <div className="card">
                  <div className="empty-state">
                    <HiOutlineUsers style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem' }} />
                    <p>No schedule found for selected faculty</p>
                  </div>
                </div>
              )
            ) : (
              <div className="card">
                <div className="empty-state">
                  <HiOutlineUsers style={{ fontSize: '3rem', color: '#9ca3af', marginBottom: '1rem' }} />
                  <h3>Select a Faculty Member</h3>
                  <p>Choose a faculty member from the dropdown to view their timetable</p>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

export default TimetablePage;
