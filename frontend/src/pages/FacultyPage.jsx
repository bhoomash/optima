import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineUsers, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';
import { facultyApi } from '../services/api';
import FacultyForm from '../components/FacultyForm';

/**
 * Faculty Management Page
 * Handles CRUD operations for faculty members
 */
function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingFaculty, setViewingFaculty] = useState(null);

  // Fetch all faculty
  const fetchFaculty = useCallback(async () => {
    try {
      setLoading(true);
      const response = await facultyApi.getAll();
      setFaculty(response.data.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching faculty' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaculty();
  }, [fetchFaculty]);

  // Handle form submit
  const handleSubmit = async (data) => {
    try {
      if (editingFaculty) {
        await facultyApi.update(editingFaculty.id, data);
        setMessage({ type: 'success', text: 'Faculty updated successfully' });
      } else {
        await facultyApi.create(data);
        setMessage({ type: 'success', text: 'Faculty created successfully' });
      }
      setShowForm(false);
      setEditingFaculty(null);
      fetchFaculty();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error saving faculty' 
      });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this faculty member?')) {
      try {
        await facultyApi.delete(id);
        setMessage({ type: 'success', text: 'Faculty deleted successfully' });
        fetchFaculty();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting faculty' });
      }
    }
  };

  // Handle edit
  const handleEdit = (facultyMember) => {
    setEditingFaculty(facultyMember);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Faculty Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => { setEditingFaculty(null); setShowForm(true); }}
        >
          <HiOutlinePlus /> Add Faculty
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Faculty Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingFaculty ? 'Edit Faculty' : 'Add New Faculty'}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <FacultyForm 
                onSubmit={handleSubmit}
                initialData={editingFaculty}
                onCancel={() => { setShowForm(false); setEditingFaculty(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Faculty Detail Modal */}
      {viewingFaculty && (
        <div className="modal-overlay" onClick={() => setViewingFaculty(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Faculty Details</h3>
              <button className="modal-close" onClick={() => setViewingFaculty(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#6b7280' }}>
                    <HiOutlineUsers />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{viewingFaculty.name}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{viewingFaculty.id}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingFaculty.department || '—'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Subjects</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingFaculty.subjectsCanTeach?.length || 0}</p>
                  </div>
                </div>
                <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Subjects Can Teach</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {viewingFaculty.subjectsCanTeach?.length > 0 ? viewingFaculty.subjectsCanTeach.map((subject, index) => (
                      <span key={index} className="badge badge-primary">{subject}</span>
                    )) : <span style={{ color: '#9ca3af' }}>None assigned</span>}
                  </div>
                </div>
                {viewingFaculty.availabilitySlots && viewingFaculty.availabilitySlots.length > 0 && (
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Availability Slots</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                      {viewingFaculty.availabilitySlots.map((slot, index) => (
                        <span key={index} className="badge badge-secondary">{slot.day} - Period {slot.period}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: '1rem', position: 'relative' }}>
        <HiOutlineSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '1.1rem' }} />
        <input
          type="text"
          placeholder="Search faculty by name, ID, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.25rem', width: '100%' }}
        />
      </div>

      {/* Faculty Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"><span></span><span></span><span></span><span></span></div>
            <p>Loading faculty...</p>
          </div>
        ) : faculty.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineUsers /></div>
            <h3>No Faculty Members</h3>
            <p>Add your first faculty member to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Subjects Can Teach</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {faculty
                  .filter((f) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      f.id?.toLowerCase().includes(q) ||
                      f.name?.toLowerCase().includes(q) ||
                      f.department?.toLowerCase().includes(q) ||
                      f.subjectsCanTeach?.some(s => s.toLowerCase().includes(q))
                    );
                  })
                  .map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.name}</td>
                    <td>{f.department}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {f.subjectsCanTeach?.map((subject, index) => (
                          <span key={index} className="badge badge-primary">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setViewingFaculty(f)}
                          title="View details"
                        >
                          <HiOutlineEye /> View
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(f)}
                        >
                          <HiOutlinePencil /> Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(f.id)}
                        >
                          <HiOutlineTrash /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyPage;
