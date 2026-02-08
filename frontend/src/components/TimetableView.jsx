import React from 'react';
import { HiOutlineBookOpen, HiOutlineUsers, HiOutlineBeaker, HiOutlineLocationMarker } from 'react-icons/hi';

/**
 * Timetable View Component
 * Displays the timetable in a grid format
 */
function TimetableView({ data, viewMode }) {
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

export default TimetableView;
