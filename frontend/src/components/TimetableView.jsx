import React, { useState, useEffect } from 'react';
import { HiOutlineBookOpen, HiOutlineUsers, HiOutlineBeaker, HiOutlineLocationMarker, HiOutlineClock } from 'react-icons/hi';

/**
 * Timetable View Component
 * Displays the timetable in a grid format (desktop) or card format (mobile)
 */
function TimetableView({ data, viewMode }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedDay, setSelectedDay] = useState('Monday');

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const periodTimes = [
    '9:00 - 9:50',
    '10:00 - 10:50',
    '11:00 - 11:50',
    '12:00 - 12:50',
    '1:00 - 1:50',
    '2:00 - 2:50',
    '3:00 - 3:50',
    '4:00 - 4:50'
  ];

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

  // Render a single timetable grid
  const renderGrid = (entity) => {
    const grid = buildGrid(entity.schedule);
    const title = viewMode === 'class' 
      ? `${entity.className || entity.classId}` 
      : `${entity.facultyName || entity.facultyId}`;

    // Mobile view - card-based layout
    if (isMobile) {
      return (
        <div className="card" key={entity.classId || entity.facultyId} style={{ marginBottom: '1.5rem' }}>
          <div className="card-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <h3 className="card-title" style={{ fontSize: '1rem' }}>
                {viewMode === 'class' ? <HiOutlineBookOpen style={{ color: '#6366f1' }} /> : <HiOutlineUsers style={{ color: '#6366f1' }} />} {title}
              </h3>
              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>
                {entity.schedule.length} classes
              </span>
            </div>
            
            {/* Day selector tabs */}
            <div style={mobileStyles.dayTabs}>
              {days.map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  style={{
                    ...mobileStyles.dayTab,
                    ...(selectedDay === day ? mobileStyles.dayTabActive : {})
                  }}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div style={{ padding: '12px' }}>
            {/* Period cards for selected day */}
            <div style={mobileStyles.periodList}>
              {periods.map(period => {
                const cell = grid[selectedDay][period];
                return (
                  <div 
                    key={period} 
                    style={{
                      ...mobileStyles.periodCard,
                      ...(cell?.isLab ? mobileStyles.labCard : {})
                    }}
                  >
                    <div style={mobileStyles.periodHeader}>
                      <span style={mobileStyles.periodNumber}>Period {period}</span>
                      <span style={mobileStyles.periodTime}>
                        <HiOutlineClock style={{ fontSize: '12px' }} /> {periodTimes[period - 1]}
                      </span>
                    </div>
                    {cell ? (
                      <div style={mobileStyles.periodContent}>
                        <div style={{ 
                          fontWeight: 600, 
                          color: cell.isLab ? '#d97706' : '#6366f1',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.9rem'
                        }}>
                          {cell.subjectName}
                          {cell.isLab && <HiOutlineBeaker style={{ fontSize: '0.9rem' }} />}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                          <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {viewMode === 'class' ? cell.facultyName : cell.className}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <HiOutlineLocationMarker /> {cell.roomId}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div style={{ color: '#ccc', fontSize: '0.85rem', textAlign: 'center', padding: '8px 0' }}>
                        No class
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Desktop view - table layout
    return (
      <div className="card" key={entity.classId || entity.facultyId} style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <h3 className="card-title">
            {viewMode === 'class' ? <HiOutlineBookOpen style={{ color: '#6366f1' }} /> : <HiOutlineUsers style={{ color: '#6366f1' }} />} {title}
          </h3>
          <span className="badge badge-primary">
            {entity.schedule.length} classes/week
          </span>
        </div>

        <div className="table-container">
          <table className="table" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Day / Period</th>
                {periods.map(period => (
                  <th key={period} style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                    <div>Period {period}</div>
                    <div style={{ fontWeight: 'normal', color: '#999' }}>{periodTimes[period - 1]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map(day => (
                <tr key={day}>
                  <td style={{ fontWeight: 600, background: '#f8f9fa' }}>{day}</td>
                  {periods.map(period => {
                    const cell = grid[day][period];
                    return (
                      <td 
                        key={period} 
                        style={{ 
                          padding: '0.5rem',
                          verticalAlign: 'top',
                          background: cell?.isLab ? '#fff3e0' : 'white',
                          borderLeft: '1px solid #e0e0e0'
                        }}
                      >
                        {cell ? (
                          <div style={{ fontSize: '0.8rem' }}>
                            <div style={{ 
                              fontWeight: 600, 
                              color: cell.isLab ? '#d97706' : '#6366f1',
                              marginBottom: '0.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              {cell.subjectName}
                              {cell.isLab && <HiOutlineBeaker style={{ fontSize: '0.8rem' }} />}
                            </div>
                            {viewMode === 'class' ? (
                              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                {cell.facultyName}
                              </div>
                            ) : (
                              <div style={{ color: '#64748b', fontSize: '0.75rem' }}>
                                {cell.className}
                              </div>
                            )}
                            <div style={{ color: '#94a3b8', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <HiOutlineLocationMarker style={{ fontSize: '0.75rem' }} /> {cell.roomId}
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: '#ccc', fontSize: '0.75rem', textAlign: 'center' }}>
                            -
                          </div>
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
    );
  };

  return (
    <div>
      {data.map(entity => renderGrid(entity))}
    </div>
  );
}

// Mobile styles
const mobileStyles = {
  dayTabs: {
    display: 'flex',
    gap: '4px',
    width: '100%',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  dayTab: {
    flex: 1,
    padding: '8px 4px',
    border: '1px solid #d4c4b0',
    backgroundColor: '#faf8f5',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '500',
    color: '#6b5b4f',
    borderRadius: '6px',
    minWidth: '45px',
    textAlign: 'center',
  },
  dayTabActive: {
    backgroundColor: '#8b7355',
    color: '#ffffff',
    borderColor: '#8b7355',
  },
  periodList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  periodCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: '#ffffff',
  },
  labCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  periodHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
    paddingBottom: '8px',
    borderBottom: '1px solid #f3f4f6',
  },
  periodNumber: {
    fontWeight: '600',
    fontSize: '0.8rem',
    color: '#374151',
  },
  periodTime: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  periodContent: {},
};

export default TimetableView;
