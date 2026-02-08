import React, { useState, useEffect, useCallback } from 'react';
import { HiOutlineUsers, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus } from 'react-icons/hi';
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

      {/* Faculty Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
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
                {faculty.map((f) => (
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
