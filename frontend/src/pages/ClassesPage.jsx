import React, { useState, useEffect, useCallback } from 'react';
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
          + Add Class
        </button>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
          <button 
            onClick={() => setMessage(null)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}
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

      {/* Classes Table */}
      <div className="card">
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading classes...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
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
                {classes.map((cls) => (
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
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleEdit(cls)}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(cls.id)}
                        >
                          Delete
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
