import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineUserGroup, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';
import { classesApi, subjectsApi } from '../services/api';
import ClassForm from '../components/ClassForm';

/**
 * Classes Management Page
 * Handles CRUD operations for classes
 */
function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingClass, setViewingClass] = useState(null);

  // Fetch all classes and subjects
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [classesRes, subjectsRes] = await Promise.all([
        classesApi.getAll(),
        subjectsApi.getAll()
      ]);
      setClasses(classesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error fetching data' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle form submit
  const handleSubmit = async (data) => {
    try {
      if (editingClass) {
        await classesApi.update(editingClass.id, data);
        setMessage({ type: 'success', text: 'Class updated successfully' });
      } else {
        await classesApi.create(data);
        setMessage({ type: 'success', text: 'Class created successfully' });
      }
      setShowForm(false);
      setEditingClass(null);
      fetchData();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Error saving class' 
      });
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await classesApi.delete(id);
        setMessage({ type: 'success', text: 'Class deleted successfully' });
        fetchData();
      } catch (error) {
        setMessage({ type: 'error', text: 'Error deleting class' });
      }
    }
  };

  // Handle edit
  const handleEdit = (classData) => {
    setEditingClass(classData);
    setShowForm(true);
  };

  // Get subject name by ID
  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : subjectId;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Classes Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => { setEditingClass(null); setShowForm(true); }}
        >
          <HiOutlinePlus /> Add Class
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

      {/* Class Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingClass ? 'Edit Class' : 'Add New Class'}
              </h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <ClassForm 
                onSubmit={handleSubmit}
                initialData={editingClass}
                subjects={subjects}
                onCancel={() => { setShowForm(false); setEditingClass(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Class Detail Modal */}
      {viewingClass && (
        <div className="modal-overlay" onClick={() => setViewingClass(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Class Details</h3>
              <button className="modal-close" onClick={() => setViewingClass(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#6b7280' }}>
                    <HiOutlineUserGroup />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{viewingClass.name}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.875rem' }}>{viewingClass.id}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingClass.department || '—'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semester</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingClass.semester || '—'}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Section</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600 }}>{viewingClass.section || '—'}</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Count</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '1.25rem' }}>{viewingClass.studentCount || 0}</p>
                  </div>
                  <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Subjects</p>
                    <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '1.25rem' }}>{viewingClass.subjects?.length || 0}</p>
                  </div>
                </div>
                <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Assigned Subjects</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                    {viewingClass.subjects?.length > 0 ? viewingClass.subjects.map((subjectId, index) => (
                      <span key={index} className="badge badge-primary">{getSubjectName(subjectId)}</span>
                    )) : <span style={{ color: '#9ca3af' }}>None assigned</span>}
                  </div>
                </div>
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
          placeholder="Search classes by name, ID, department, or semester..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input"
          style={{ paddingLeft: '2.25rem', width: '100%' }}
        />
      </div>

      {/* Classes Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
            <p>Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><HiOutlineUserGroup /></div>
            <h3>No Classes</h3>
            <p>Add your first class to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Semester</th>
                  <th>Section</th>
                  <th>Students</th>
                  <th>Subjects</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes
                  .filter((cls) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      cls.id?.toLowerCase().includes(q) ||
                      cls.name?.toLowerCase().includes(q) ||
                      cls.department?.toLowerCase().includes(q) ||
                      String(cls.semester).toLowerCase().includes(q) ||
                      cls.section?.toLowerCase().includes(q)
                    );
                  })
                  .map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.id}</td>
                    <td>{cls.name}</td>
                    <td>{cls.department}</td>
                    <td>{cls.semester}</td>
                    <td>{cls.section}</td>
                    <td>{cls.studentCount}</td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '200px' }}>
                        {cls.subjects?.slice(0, 3).map((subjectId, index) => (
                          <span key={index} className="badge badge-primary">
                            {getSubjectName(subjectId)}
                          </span>
                        ))}
                        {cls.subjects?.length > 3 && (
                          <span className="badge badge-secondary">
                            +{cls.subjects.length - 3} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="actions">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => setViewingClass(cls)}
                          title="View details"
                        >
                          <HiOutlineEye /> View
                        </button>
                        <button 
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(cls)}
                        >
                          <HiOutlinePencil /> Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(cls.id)}
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

export default ClassesPage;
