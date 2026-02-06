import React, { useState, useEffect } from 'react';

/**
 * Class Form Component
 * Form for creating/editing classes
 */
function ClassForm({ onSubmit, initialData, subjects, onCancel }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    department: '',
    semester: 1,
    section: 'A',
    studentCount: 30,
    subjects: []
  });

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        department: initialData.department || '',
        semester: initialData.semester || 1,
        section: initialData.section || 'A',
        studentCount: initialData.studentCount || 30,
        subjects: initialData.subjects || []
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? parseInt(value) || '' : value 
    }));
  };

  // Handle subject selection
  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectId)
        ? prev.subjects.filter(id => id !== subjectId)
        : [...prev.subjects, subjectId]
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Filter subjects by semester
  const filteredSubjects = subjects.filter(s => s.semester === formData.semester);

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Class ID *</label>
          <input
            type="text"
            name="id"
            className="form-input"
            value={formData.id}
            onChange={handleChange}
            placeholder="e.g., CLS001"
            required
            disabled={!!initialData}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Class Name *</label>
          <input
            type="text"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., CS 3rd Sem A"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Department *</label>
        <input
          type="text"
          name="department"
          className="form-input"
          value={formData.department}
          onChange={handleChange}
          placeholder="e.g., Computer Science"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Semester *</label>
          <select
            name="semester"
            className="form-select"
            value={formData.semester}
            onChange={handleChange}
            required
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
              <option key={sem} value={sem}>Semester {sem}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Section</label>
          <select
            name="section"
            className="form-select"
            value={formData.section}
            onChange={handleChange}
          >
            {['A', 'B', 'C', 'D', 'E'].map(sec => (
              <option key={sec} value={sec}>Section {sec}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Student Count *</label>
          <input
            type="number"
            name="studentCount"
            className="form-input"
            value={formData.studentCount}
            onChange={handleChange}
            min="1"
            max="200"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Subjects for this Class</label>
        {filteredSubjects.length > 0 ? (
          <div style={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            padding: '0.75rem',
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {filteredSubjects.map(subject => (
              <label 
                key={subject.id} 
                className="form-checkbox"
                style={{ 
                  display: 'flex', 
                  padding: '0.5rem',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  background: formData.subjects.includes(subject.id) ? '#e3f2fd' : 'transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={formData.subjects.includes(subject.id)}
                  onChange={() => handleSubjectToggle(subject.id)}
                />
                <span style={{ flex: 1 }}>
                  <strong>{subject.name}</strong>
                  <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                    ({subject.code}) - {subject.weeklyHours} hrs/week
                    {subject.isLab && <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>Lab</span>}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p style={{ color: '#999', fontSize: '0.9rem' }}>
            No subjects available for semester {formData.semester}. Add subjects first.
          </p>
        )}
        <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.5rem' }}>
          Selected: {formData.subjects.length} subject(s)
        </p>
      </div>

      <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update Class' : 'Add Class'}
        </button>
      </div>
    </form>
  );
}

export default ClassForm;
