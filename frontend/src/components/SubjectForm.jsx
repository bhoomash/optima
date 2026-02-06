import React, { useState, useEffect } from 'react';

/**
 * Subject Form Component
 * Form for creating/editing subjects
 */
function SubjectForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    code: '',
    department: '',
    weeklyHours: 3,
    isLab: false,
    labHoursPerSession: 2,
    semester: 1
  });

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        code: initialData.code || '',
        department: initialData.department || '',
        weeklyHours: initialData.weeklyHours || 3,
        isLab: initialData.isLab || false,
        labHoursPerSession: initialData.labHoursPerSession || 2,
        semester: initialData.semester || 1
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : 
              (type === 'number' ? parseInt(value) || '' : value)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Subject ID *</label>
          <input
            type="text"
            name="id"
            className="form-input"
            value={formData.id}
            onChange={handleChange}
            placeholder="e.g., SUB001"
            required
            disabled={!!initialData}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Subject Code *</label>
          <input
            type="text"
            name="code"
            className="form-input"
            value={formData.code}
            onChange={handleChange}
            placeholder="e.g., CS201"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Subject Name *</label>
        <input
          type="text"
          name="name"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Data Structures"
          required
        />
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
          <label className="form-label">Weekly Hours *</label>
          <input
            type="number"
            name="weeklyHours"
            className="form-input"
            value={formData.weeklyHours}
            onChange={handleChange}
            min="1"
            max="10"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-checkbox">
          <input
            type="checkbox"
            name="isLab"
            checked={formData.isLab}
            onChange={handleChange}
          />
          <span>This is a Lab Subject</span>
        </label>
      </div>

      {formData.isLab && (
        <div className="form-group">
          <label className="form-label">Lab Hours Per Session</label>
          <select
            name="labHoursPerSession"
            className="form-select"
            value={formData.labHoursPerSession}
            onChange={handleChange}
          >
            <option value={2}>2 hours (consecutive)</option>
            <option value={3}>3 hours (consecutive)</option>
            <option value={4}>4 hours (consecutive)</option>
          </select>
          <p style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Lab sessions will be scheduled in consecutive time slots
          </p>
        </div>
      )}

      <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update Subject' : 'Add Subject'}
        </button>
      </div>
    </form>
  );
}

export default SubjectForm;
