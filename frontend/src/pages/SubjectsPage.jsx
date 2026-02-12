import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineBookOpen, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';
import { subjectsApi } from '../services/api';
import SubjectForm from '../components/SubjectForm';

/**
 * Subjects Management Page
 * Handles CRUD operations for subjects
 */
function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingSubject, setViewingSubject] = useState(null);

  // Fetch all subjects
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await subjectsApi.getAll();
      setSubjects(response.data.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching subjects' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // Handle form submit
  const handleSubmit = async (data) => {
    try {
      if (editingSubject) {
        await subjectsApi.update(editingSubject.id, data);
        setMessage({ type: 'success', text: 'Subject updated successfully' });
      } else {
        await subjectsApi.create(data);
        setMessage({ type: 'success', text: 'Subject created successfully' });
      }
      setShowForm(false);
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error saving subject' 
      });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectsApi.delete(id);
        setMessage({ type: 'success', text: 'Subject deleted successfully' });
        fetchSubjects();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting subject' });
      }
    }
  };

  // Handle edit
  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setShowForm(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Subjects Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => { setEditingSubject(null); setShowForm(true); }}
        >
          <HiOutlinePlus /> Add Subject
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

      {/* Subject Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <SubjectForm 
                onSubmit={handleSubmit}
                initialData={editingSubject}
                onCancel={() => { setShowForm(false); setEditingSubject(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Subject Detail Modal */}
      {viewingSubject && (
        <div className="modal-overlay" onClick={() => setViewingSubject(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Subject Details</h3>
              <button className="modal-close" onClick={() => setViewingSubject(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#6b7280' }}>
                    <HiOutlineBookOpen />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{viewingSubject.name}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{viewingSubject.id}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Code</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingSubject.code || '—'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingSubject.department || '—'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semester</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingSubject.semester || '—'}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Hours</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '1.25rem' }}>{viewingSubject.weeklyHours || 0}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>
                      <span className={`badge ${viewingSubject.isLab ? 'badge-warning' : 'badge-primary'}`}>
                        {viewingSubject.isLab ? 'Lab' : 'Theory'}
                      </span>
                    </p>
                  </div>
                </div>
                {viewingSubject.isLab && (
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lab Hours Per Session</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingSubject.labHoursPerSession || '—'}</p>
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
          placeholder="Search subjects by name, code, department, or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.25rem', width: '100%' }}
        />
      </div>

      {/* Subjects Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <p>Loading subjects...</p>
          </div>
        ) : subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineBookOpen /></div>
            <h3>No Subjects</h3>
            <p>Add your first subject to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Weekly Hours</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subjects
                  .filter((subject) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      subject.id?.toLowerCase().includes(q) ||
                      subject.code?.toLowerCase().includes(q) ||
                      subject.name?.toLowerCase().includes(q) ||
                      subject.department?.toLowerCase().includes(q) ||
                      String(subject.semester).toLowerCase().includes(q) ||
                      (subject.isLab ? 'lab' : 'theory').includes(q)
                    );
                  })
                  .map((subject) => (
                  <tr key={subject.id}>
                    <td>{subject.id}</td>
                    <td>{subject.code}</td>
                    <td>{subject.name}</td>
                    <td>{subject.department}</td>
                    <td>{subject.semester}</td>
                    <td>{subject.weeklyHours}</td>
                    <td>
                      <span className={`badge ${subject.isLab ? 'badge-warning' : 'badge-primary'}`}>
                        {subject.isLab ? 'Lab' : 'Theory'}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setViewingSubject(subject)}
                          title="View details"
                        >
                          <HiOutlineEye /> View
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(subject)}
                        >
                          <HiOutlinePencil /> Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(subject.id)}
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

export default SubjectsPage;
