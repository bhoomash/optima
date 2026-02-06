import React, { useState, useEffect } from 'react';

/**
 * Faculty Form Component
 * Form for creating/editing faculty members
 */
function FacultyForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    department: '',
    subjectsCanTeach: [],
    maxHoursPerDay: 6
  });
  const [subjectInput, setSubjectInput] = useState('');

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || '',
        department: initialData.department || '',
        subjectsCanTeach: initialData.subjectsCanTeach || [],
        maxHoursPerDay: initialData.maxHoursPerDay || 6
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Add subject to list
  const handleAddSubject = () => {
    if (subjectInput.trim() && !formData.subjectsCanTeach.includes(subjectInput.trim())) {
      setFormData(prev => ({
        ...prev,
        subjectsCanTeach: [...prev.subjectsCanTeach, subjectInput.trim()]
      }));
      setSubjectInput('');
    }
  };

  // Remove subject from list
  const handleRemoveSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      subjectsCanTeach: prev.subjectsCanTeach.filter(s => s !== subject)
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Faculty ID *</label>
        <input
          type="text"
          name="id"
          className="form-input"
          value={formData.id}
          onChange={handleChange}
          placeholder="e.g., FAC001"
          required
          disabled={!!initialData}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Full Name *</label>
        <input
          type="text"
          name="name"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Dr. John Smith"
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

      <div className="form-group">
        <label className="form-label">Max Hours Per Day</label>
        <input
          type="number"
          name="maxHoursPerDay"
          className="form-input"
          value={formData.maxHoursPerDay}
          onChange={handleChange}
          min="1"
          max="8"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Subjects Can Teach *</label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            value={subjectInput}
            onChange={(e) => setSubjectInput(e.target.value)}
            placeholder="Enter subject ID (e.g., SUB001)"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
          />
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={handleAddSubject}
          >
            Add
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
          {formData.subjectsCanTeach.map((subject, index) => (
            <span key={index} className="chip">
              {subject}
              <button 
                type="button"
                className="chip-remove"
                onClick={() => handleRemoveSubject(subject)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {formData.subjectsCanTeach.length === 0 && (
          <p style={{ color: '#999', fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Add at least one subject ID
          </p>
        )}
      </div>

      <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={formData.subjectsCanTeach.length === 0}
        >
          {initialData ? 'Update Faculty' : 'Add Faculty'}
        </button>
      </div>
    </form>
  );
}

export default FacultyForm;
