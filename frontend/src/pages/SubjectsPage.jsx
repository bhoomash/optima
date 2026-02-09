import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineBookOpen, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
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

      {/* Subjects Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"><span></span><span></span><span></span><span></span></div>
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
                {subjects.map((subject) => (
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
