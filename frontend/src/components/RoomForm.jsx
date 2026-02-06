import React, { useState, useEffect } from 'react';

/**
 * Room Form Component
 * Form for creating/editing rooms
 */
function RoomForm({ onSubmit, initialData, onCancel }) {
  const [formData, setFormData] = useState({
    roomId: '',
    name: '',
    type: 'classroom',
    capacity: 30,
    building: '',
    floor: ''
  });

  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      setFormData({
        roomId: initialData.roomId || '',
        name: initialData.name || '',
        type: initialData.type || 'classroom',
        capacity: initialData.capacity || 30,
        building: initialData.building || '',
        floor: initialData.floor || ''
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'capacity' || name === 'floor' ? parseInt(value) || '' : value 
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
        <label className="form-label">Room ID *</label>
        <input
          type="text"
          name="roomId"
          className="form-input"
          value={formData.roomId}
          onChange={handleChange}
          placeholder="e.g., CR101 or LAB01"
          required
          disabled={!!initialData}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Room Name *</label>
        <input
          type="text"
          name="name"
          className="form-input"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g., Classroom 101"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Room Type *</label>
        <select
          name="type"
          className="form-select"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="classroom">Classroom</option>
          <option value="lab">Lab</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Capacity *</label>
        <input
          type="number"
          name="capacity"
          className="form-input"
          value={formData.capacity}
          onChange={handleChange}
          min="1"
          max="500"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Building</label>
          <input
            type="text"
            name="building"
            className="form-input"
            value={formData.building}
            onChange={handleChange}
            placeholder="e.g., Main Building"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Floor</label>
          <input
            type="number"
            name="floor"
            className="form-input"
            value={formData.floor}
            onChange={handleChange}
            min="0"
            max="20"
            placeholder="e.g., 1"
          />
        </div>
      </div>

      <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {initialData ? 'Update Room' : 'Add Room'}
        </button>
      </div>
    </form>
  );
}

export default RoomForm;
