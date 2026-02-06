/**
 * Faculty Timetable Page
 * Displays the specific faculty member's timetable after login
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { timetableApi } from '../services/api';

const FacultyTimetablePage = () => {
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const periodTimes = [
    '9:00-9:50', '10:00-10:50', '11:00-11:50', '12:00-12:50',
    '1:00-1:50', '2:00-2:50', '3:00-3:50', '4:00-4:50'
  ];

  // Check if faculty is logged in
  useEffect(() => {
    const storedInfo = localStorage.getItem('facultyInfo');
    if (!storedInfo) {
      navigate('/login', { replace: true });
      return;
    }
    
    try {
      const info = JSON.parse(storedInfo);
      setFacultyInfo(info);
    } catch (e) {
      localStorage.removeItem('facultyToken');
      localStorage.removeItem('facultyInfo');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Fetch faculty timetable
  const fetchTimetable = useCallback(async () => {
    if (!facultyInfo?.id) return;
    
    try {
      setLoading(true);
      const response = await timetableApi.getFacultySchedule(facultyInfo.id);
      
      if (response.data.success) {
        setScheduleData(response.data.data);
      } else {
        setError('Failed to load timetable');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching timetable');
    } finally {
      setLoading(false);
    }
  }, [facultyInfo?.id]);

  useEffect(() => {
    if (facultyInfo?.id) {
      fetchTimetable();
    }
  }, [facultyInfo?.id, fetchTimetable]);

  // Build grid from schedule
  const buildGrid = () => {
    const grid = {};
    
    days.forEach(day => {
      grid[day] = {};
      periods.forEach(period => {
        grid[day][period] = null;
      });
    });

    if (scheduleData?.schedule) {
      scheduleData.schedule.forEach(entry => {
        if (grid[entry.day] && grid[entry.day][entry.period] === null) {
          grid[entry.day][entry.period] = entry;
        }
      });
    }

    return grid;
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('facultyToken');
    localStorage.removeItem('facultyInfo');
    navigate('/login', { replace: true });
  };

  // Download PDF
  const handleDownloadPDF = () => {
    if (!scheduleData) return;

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(31, 41, 55);
    doc.text(`Timetable: ${facultyInfo.name}`, pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text(`Department: ${facultyInfo.department} | ${scheduleData.totalClasses} classes/week`, pageWidth / 2, 22, { align: 'center' });

    // Build table
    const grid = buildGrid();
    const tableHeaders = ['Day', ...periods.map((p, i) => `P${p}\n${periodTimes[i]}`)];
    
    const tableBody = days.map(day => {
      const row = [day];
      periods.forEach(period => {
        const cell = grid[day][period];
        if (cell) {
          const cellText = `${cell.subjectName || cell.subjectId}${cell.isLab ? ' (Lab)' : ''}\n${cell.className || cell.classId}\n${cell.roomName || cell.roomId}`;
          row.push(cellText);
        } else {
          row.push('-');
        }
      });
      return row;
    });

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
      didParseCell: function(data) {
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
    doc.text('Smart University Resource Scheduling System', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });

    doc.save(`${facultyInfo.name.replace(/\s+/g, '_')}-timetable.pdf`);
  };

  const grid = buildGrid();

  if (!facultyInfo) {
    return null;
  }

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <div style={styles.main}>
        <div style={styles.titleRow}>
          <div>
            <h2 style={styles.pageTitle}>My Timetable</h2>
            <p style={styles.facultySubtitle}>👨‍🏫 {facultyInfo.name} • {facultyInfo.department}</p>
          </div>
          <div style={styles.titleButtons}>
            {scheduleData && (
              <button onClick={handleDownloadPDF} style={styles.downloadBtn}>
                📥 Download PDF
              </button>
            )}
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div style={styles.card}>
            <div style={styles.loadingContainer}>
              <div style={styles.spinner}></div>
              <p>Loading your timetable...</p>
            </div>
          </div>
        ) : error ? (
          <div style={styles.card}>
            <div style={styles.errorState}>
              <div style={styles.errorIcon}>⚠️</div>
              <h3>Error Loading Timetable</h3>
              <p>{error}</p>
              <button onClick={fetchTimetable} style={styles.retryBtn}>
                Try Again
              </button>
            </div>
          </div>
        ) : !scheduleData || scheduleData.totalClasses === 0 ? (
          <div style={styles.card}>
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📅</div>
              <h3>No Schedule Found</h3>
              <p>No classes have been assigned to you yet.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div style={styles.statsRow}>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>{scheduleData.totalClasses}</span>
                <span style={styles.statLabel}>Classes per Week</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statNumber}>{facultyInfo.subjectsCanTeach?.length || 0}</span>
                <span style={styles.statLabel}>Subjects</span>
              </div>
            </div>

            {/* Timetable Grid */}
            <div style={styles.card}>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Day / Period</th>
                      {periods.map(period => (
                        <th key={period} style={styles.th}>
                          <div>Period {period}</div>
                          <div style={styles.periodTime}>{periodTimes[period - 1]}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(day => (
                      <tr key={day}>
                        <td style={styles.dayCell}>{day}</td>
                        {periods.map(period => {
                          const cell = grid[day][period];
                          return (
                            <td 
                              key={period} 
                              style={{
                                ...styles.td,
                                backgroundColor: cell?.isLab ? '#fff3e0' : 'white'
                              }}
                            >
                              {cell ? (
                                <div style={styles.cellContent}>
                                  <div style={{
                                    ...styles.subjectName,
                                    color: cell.isLab ? '#e65100' : '#1976d2'
                                  }}>
                                    {cell.subjectName || cell.subjectId}
                                    {cell.isLab && <span style={styles.labIcon}> 🔬</span>}
                                  </div>
                                  <div style={styles.className}>
                                    {cell.className || cell.classId}
                                  </div>
                                  <div style={styles.roomName}>
                                    📍 {cell.roomName || cell.roomId}
                                  </div>
                                </div>
                              ) : (
                                <div style={styles.emptyCell}>-</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        Smart University Resource Scheduling System © 2026
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column'
  },
  logoutBtn: {
    backgroundColor: '#DC2626',
    color: '#ffffff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  main: {
    flex: 1,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
    width: '100%',
    boxSizing: 'border-box'
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  pageTitle: {
    margin: 0,
    color: '#1F2937',
    fontSize: '1.5rem'
  },
  facultySubtitle: {
    margin: '0.25rem 0 0 0',
    color: '#6B7280',
    fontSize: '0.9rem'
  },
  titleButtons: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  downloadBtn: {
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  statsRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '150px'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a73e8'
  },
  statLabel: {
    fontSize: '0.875rem',
    color: '#6B7280'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    tableLayout: 'fixed'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '0.75rem',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: '0.8rem',
    borderBottom: '2px solid #e0e0e0',
    color: '#374151'
  },
  periodTime: {
    fontWeight: 'normal',
    color: '#999',
    fontSize: '0.7rem'
  },
  dayCell: {
    padding: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#f8f9fa',
    borderRight: '1px solid #e0e0e0'
  },
  td: {
    padding: '0.5rem',
    verticalAlign: 'top',
    borderBottom: '1px solid #e0e0e0',
    borderRight: '1px solid #e0e0e0',
    minWidth: '100px'
  },
  cellContent: {
    fontSize: '0.8rem'
  },
  subjectName: {
    fontWeight: '600',
    marginBottom: '0.25rem'
  },
  labIcon: {
    fontSize: '0.7rem'
  },
  className: {
    color: '#666',
    fontSize: '0.75rem'
  },
  roomName: {
    color: '#999',
    fontSize: '0.7rem'
  },
  emptyCell: {
    color: '#ccc',
    textAlign: 'center'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem',
    color: '#6B7280'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e0e0e0',
    borderTopColor: '#1a73e8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '1rem'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6B7280'
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  errorState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#DC2626'
  },
  errorIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  retryBtn: {
    backgroundColor: '#1a73e8',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '1rem'
  },
  footer: {
    textAlign: 'center',
    padding: '1rem',
    color: '#666',
    fontSize: '0.85rem'
  }
};

export default FacultyTimetablePage;
