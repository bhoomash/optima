import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { HiOutlineDownload, HiOutlineRefresh, HiOutlineCalendar, HiOutlineCheckCircle, HiOutlineExclamationCircle } from 'react-icons/hi';
import { timetableApi, classesApi } from '../services/api';
import TimetableView from '../components/TimetableView';
import { useAuth } from '../contexts/AuthContext';

/**
 * Timetable Page
 * Displays generated timetable and provides generation controls
 */
function TimetablePage() {
  const [timetableData, setTimetableData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
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
      const [timetableRes, classesRes] = await Promise.all([
        timetableApi.getActive().catch(() => ({ data: { data: null } })),
        classesApi.getAll()
      ]);

      if (timetableRes.data.data) {
        setTimetableData(timetableRes.data.data);
      }
      setClasses(classesRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    if (!filteredData || filteredData.length === 0) {
      setMessage({ type: 'error', text: 'No timetable data to download' });
      return;
    }

    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    
    filteredData.forEach((entity, index) => {
      if (index > 0) {
        doc.addPage();
      }

      const title = `Timetable: ${entity.className || entity.classId}`;

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
            const cellText = `${cell.subjectName}${cell.isLab ? ' (Lab)' : ''}\n${cell.facultyName}\n${cell.roomName}`;
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
    const fileName = selectedClass === 'all' ? 'all-classes-timetable.pdf' : `class-${selectedClass}-timetable.pdf`;
    
    doc.save(fileName);
    setMessage({ type: 'success', text: 'PDF downloaded successfully!' });
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2>Timetable</h2>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {timetableData && (
            <button 
              className="btn btn-secondary"
              onClick={handleDownloadPDF}
              title="Download as PDF"
            >
              <HiOutlineDownload /> Download PDF
            </button>
          )}
          {canGenerate && (
            <button 
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                  Generating...
                </>
              ) : (
                <><HiOutlineRefresh /> Generate New Timetable</>
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
            <div className="spinner"></div>
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
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3>{timetableData.timetable?.name || 'Current Timetable'}</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Generated: {new Date(timetableData.timetable?.generatedAt).toLocaleString()} | 
                  Entries: {timetableData.timetable?.schedule?.length || 0}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Class Filter */}
                <select 
                  className="form-select"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  style={{ width: 'auto' }}
                >
                  <option value="all">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Timetable View */}
          {filteredData && filteredData.length > 0 ? (
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
          )}
        </>
      )}
    </div>
  );
}

export default TimetablePage;
